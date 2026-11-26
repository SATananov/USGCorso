package expo.modules.usgocr

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.graphics.Color
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

    AsyncFunction("recognizeText") { uri: String, languages: String, layout: String, processing: String ->
      val context = appContext.reactContext
        ?: throw IllegalStateException("Android context is unavailable")
      val dataRoot = File(context.filesDir, "usg-tesseract-v2")
      val tessdataDir = File(dataRoot, "tessdata")

      require(languages.split("+").all { it in setOf("bul", "eng", "ita") })
      prepareLanguageData(context, languages, tessdataDir)

      val decoded = decodeScaledBitmap(context, uri, 3000)
        ?: throw IllegalArgumentException("Unable to decode image")

      val bitmap = if (processing == "contrast") {
        try { contrastBitmap(decoded) } finally { decoded.recycle() }
      } else decoded
      val tess = TessBaseAPI()

      try {
        if (!tess.init(dataRoot.absolutePath, languages)) {
          throw IllegalStateException("Unable to initialize Tesseract")
        }

        tess.setPageSegMode(when (layout) {
          "block" -> TessBaseAPI.PageSegMode.PSM_SINGLE_BLOCK
          "sparse" -> TessBaseAPI.PageSegMode.PSM_SPARSE_TEXT
          else -> TessBaseAPI.PageSegMode.PSM_AUTO
        })
        tess.setVariable("preserve_interword_spaces", "1")
        tess.setImage(bitmap)

        val text = tess.getUTF8Text()?.trim().orEmpty()
        val confidence = if (text.isBlank()) 0 else tess.meanConfidence()

        mapOf(
          "text" to text,
          "confidence" to confidence,
          "languages" to languages,
          "layout" to layout,
          "processing" to processing
        )
      } finally {
        tess.recycle()
        bitmap.recycle()
      }
    }
  }

  private fun contrastBitmap(source: Bitmap): Bitmap {
    val width = source.width
    val height = source.height
    val pixels = IntArray(width * height)
    source.getPixels(pixels, 0, width, 0, 0, width, height)
    val histogram = IntArray(256)
    for (i in pixels.indices) {
      val p = pixels[i]
      val gray = (Color.red(p) * 299 + Color.green(p) * 587 + Color.blue(p) * 114) / 1000
      pixels[i] = gray
      histogram[gray]++
    }
    val cutoff = pixels.size / 100
    var low = 0
    var high = 255
    var count = 0
    while (low < 255 && count + histogram[low] <= cutoff) { count += histogram[low]; low++ }
    count = 0
    while (high > 0 && count + histogram[high] <= cutoff) { count += histogram[high]; high-- }
    val range = high - low
    val invert = histogram.take(128).sum() > pixels.size / 2
    for (i in pixels.indices) {
      val gray = if (range >= 32) ((pixels[i] - low) * 255 / range).coerceIn(0, 255) else pixels[i]
      val value = if (invert) 255 - gray else gray
      pixels[i] = Color.rgb(value, value, value)
    }
    return Bitmap.createBitmap(pixels, width, height, Bitmap.Config.ARGB_8888)
  }

  @Synchronized
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
            val temporary = File(tessdataDir, "$language.traineddata.tmp")
            FileOutputStream(temporary).use { output -> input.copyTo(output) }
            if (!temporary.renameTo(target)) {
              temporary.delete()
              throw IllegalStateException("Unable to install OCR language data")
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
