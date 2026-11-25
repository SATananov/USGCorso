package expo.modules.usgocr

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.media.ExifInterface
import android.net.Uri
import com.googlecode.tesseract.android.TessBaseAPI
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.File
import java.io.FileOutputStream
import kotlin.math.max

class USGOcrModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("USGOcr")

    AsyncFunction("recognizeText") { uri: String, languages: String ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("Android context is unavailable")
      val dataRoot = File(context.filesDir, "usg-tesseract")
      val tessdataDir = File(dataRoot, "tessdata")

      prepareLanguageData(context, languages, tessdataDir)

      val bitmap = decodeScaledBitmap(context, uri, 3000)
        ?: throw IllegalArgumentException("Unable to decode image")

      val tess = TessBaseAPI()

      try {
        if (!tess.init(dataRoot.absolutePath, languages)) {
          throw IllegalStateException("Unable to initialize Tesseract")
        }

        tess.setPageSegMode(TessBaseAPI.PageSegMode.PSM_AUTO)
        tess.setVariable("preserve_interword_spaces", "1")
        tess.setImage(bitmap)

        val text = tess.getUTF8Text()?.trim().orEmpty()
        val confidence = if (text.isBlank()) 0 else tess.meanConfidence()

        mapOf(
          "text" to text,
          "confidence" to confidence,
          "languages" to languages
        )
      } finally {
        tess.recycle()
        bitmap.recycle()
      }
    }
  }

  private fun prepareLanguageData(
    context: Context,
    languages: String,
    tessdataDir: File
  ) {
    if (!tessdataDir.exists() && !tessdataDir.mkdirs()) {
      throw IllegalStateException("Unable to create tessdata directory")
    }

    languages
      .split("+")
      .map { it.trim() }
      .filter { it.isNotEmpty() }
      .distinct()
      .forEach { language ->
        val target = File(tessdataDir, "$language.traineddata")

        if (!target.exists() || target.length() == 0L) {
          context.assets.open("tessdata/$language.traineddata").use { input ->
            FileOutputStream(target).use { output ->
              input.copyTo(output)
            }
          }
        }
      }
  }

  private fun decodeScaledBitmap(
    context: Context,
    uriValue: String,
    maxDimension: Int
  ): Bitmap? {
    val bounds = BitmapFactory.Options().apply {
      inJustDecodeBounds = true
    }

    decodeBitmap(context, uriValue, bounds)

    if (bounds.outWidth <= 0 || bounds.outHeight <= 0) {
      return null
    }

    var sampleSize = 1
    val width = bounds.outWidth
    val height = bounds.outHeight

    while (max(width, height) / (sampleSize * 2) >= maxDimension) {
      sampleSize *= 2
    }

    val options = BitmapFactory.Options().apply {
      inSampleSize = sampleSize
      inPreferredConfig = Bitmap.Config.ARGB_8888
    }

    val decoded = decodeBitmap(context, uriValue, options) ?: return null
    val uri = Uri.parse(uriValue)
    val orientation = try {
      context.contentResolver.openInputStream(uri)?.use { stream ->
        ExifInterface(stream).getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)
      } ?: ExifInterface.ORIENTATION_NORMAL
    } catch (_: Exception) {
      ExifInterface.ORIENTATION_NORMAL
    }
    val matrix = Matrix()
    when (orientation) {
      ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> matrix.setScale(-1f, 1f)
      ExifInterface.ORIENTATION_ROTATE_180 -> matrix.setRotate(180f)
      ExifInterface.ORIENTATION_FLIP_VERTICAL -> matrix.setScale(1f, -1f)
      ExifInterface.ORIENTATION_TRANSPOSE -> { matrix.setRotate(90f); matrix.postScale(-1f, 1f) }
      ExifInterface.ORIENTATION_ROTATE_90 -> matrix.setRotate(90f)
      ExifInterface.ORIENTATION_TRANSVERSE -> { matrix.setRotate(-90f); matrix.postScale(-1f, 1f) }
      ExifInterface.ORIENTATION_ROTATE_270 -> matrix.setRotate(-90f)
    }
    val scale = minOf(1f, maxDimension.toFloat() / max(decoded.width, decoded.height))
    matrix.postScale(scale, scale)
    return try {
      val result = Bitmap.createBitmap(decoded, 0, 0, decoded.width, decoded.height, matrix, true)
      if (result !== decoded) decoded.recycle()
      result
    } catch (error: Exception) {
      decoded.recycle()
      throw error
    }
  }

  private fun decodeBitmap(
    context: Context,
    uriValue: String,
    options: BitmapFactory.Options
  ): Bitmap? {
    val uri = Uri.parse(uriValue)

    return if (uri.scheme == "file") {
      BitmapFactory.decodeFile(uri.path, options)
    } else {
      context.contentResolver.openInputStream(uri)?.use { stream ->
        BitmapFactory.decodeStream(stream, null, options)
      }
    }
  }
}
