package expo.modules.usgocr

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
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

      val bitmap = decodeScaledBitmap(context, uri, 2400)
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
    var width = bounds.outWidth
    var height = bounds.outHeight

    while (max(width, height) / sampleSize > maxDimension) {
      sampleSize *= 2
    }

    val options = BitmapFactory.Options().apply {
      inSampleSize = sampleSize
      inPreferredConfig = Bitmap.Config.ARGB_8888
    }

    return decodeBitmap(context, uriValue, options)
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
