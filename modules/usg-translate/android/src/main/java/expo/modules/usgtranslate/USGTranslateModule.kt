package expo.modules.usgtranslate

import com.google.mlkit.common.model.DownloadConditions
import com.google.mlkit.nl.translate.TranslateLanguage
import com.google.mlkit.nl.translate.Translation
import com.google.mlkit.nl.translate.TranslatorOptions
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class USGTranslateModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("USGTranslate")

    AsyncFunction("translateText") { text: String, source: String, target: String, promise: Promise ->
      val sourceCode = TranslateLanguage.fromLanguageTag(source)
      val targetCode = TranslateLanguage.fromLanguageTag(target)

      if (sourceCode == null || targetCode == null || source !in setOf("bg", "en", "it") || target !in setOf("bg", "en", "it")) {
        promise.reject("INVALID_LANGUAGE", "Only bg, en and it are supported", null)
      } else if (text.isBlank() || sourceCode == targetCode) {
        promise.resolve(text)
      } else {
        val options = TranslatorOptions.Builder()
          .setSourceLanguage(sourceCode)
          .setTargetLanguage(targetCode)
          .build()
        val translator = Translation.getClient(options)
        val conditions = DownloadConditions.Builder().requireWifi().build()

        translator.downloadModelIfNeeded(conditions)
          .addOnSuccessListener {
            translator.translate(text)
              .addOnSuccessListener { result ->
                translator.close()
                promise.resolve(result)
              }
              .addOnFailureListener { error ->
                translator.close()
                promise.reject("TRANSLATION_FAILED", error.message, error)
              }
          }
          .addOnFailureListener { error ->
            translator.close()
            promise.reject("MODEL_DOWNLOAD_FAILED", error.message, error)
          }
      }
    }
  }
}
