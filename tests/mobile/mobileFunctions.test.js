import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import OcrOptions from '../../src/components/OcrOptions';
import OcrTestLabScreen from '../../src/screens/OcrTestLabScreen';
import ScanTextButton from '../../src/components/ScanTextButton';
import { recognizeTextFromImage, scanQrFromImage } from '../../src/ocr/ocrService';
import { recognizeWithTesseract } from '../../src/ocr/providers/tesseractProvider';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
}));

jest.mock('../../src/ocr/providers/tesseractProvider', () => ({
  recognizeWithTesseract: jest.fn(),
}));

jest.mock('../../src/ocr/ocrService', () => ({
  OCR_MODELS: { bg: 'bul', en: 'eng', it: 'ita', all: 'bul+eng+ita' },
  recognizeTextFromImage: jest.fn(),
  scanQrFromImage: jest.fn(),
}));

const colors = {
  background: '#000000',
  surface: '#111111',
  text: '#ffffff',
  textSoft: '#cccccc',
  textMuted: '#888888',
  gold: '#ffcc00',
  goldSoft: '#ddbb55',
  border: '#333333',
};

describe('OCR options and picker handlers', () => {
  beforeEach(() => {
    ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({ granted: true });
    ImagePicker.launchImageLibraryAsync.mockResolvedValue({ canceled: true, assets: [] });
    ImagePicker.launchCameraAsync.mockResolvedValue({ canceled: true, assets: [] });
    recognizeWithTesseract.mockResolvedValue({ text: 'Recognized result', confidence: 90 });
    recognizeTextFromImage.mockResolvedValue({ text: 'Recognized result', confidence: 90 });
    scanQrFromImage.mockResolvedValue({ codes: [] });
  });

  test('selects mixed language and other OCR options through the callback', async () => {
    const onChange = jest.fn();
    const value = { language: 'en', layout: 'auto', processing: 'original' };
    await render(<OcrOptions colors={colors} language="en" value={value} onChange={onChange} />);

    await fireEvent.press(screen.getByText('Mixed'));
    expect(onChange).toHaveBeenCalledWith({ ...value, language: 'all' });
  });

  test('camera permission denial prevents picker and OCR calls', async () => {
    ImagePicker.requestCameraPermissionsAsync.mockResolvedValue({ granted: false });
    await render(<OcrTestLabScreen />);
    await fireEvent.press(screen.getByText('CAMERA'));

    expect(await screen.findByText('Camera or photo permission is required.')).toBeTruthy();
    expect(ImagePicker.launchCameraAsync).not.toHaveBeenCalled();
    expect(recognizeWithTesseract).not.toHaveBeenCalled();
  });

  test('OCR Test Lab cancellation passes allowsEditing and does not call native OCR', async () => {
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({
      canceled: false,
      assets: [{ uri: 'file://first.jpg' }],
    }).mockResolvedValueOnce({ canceled: true, assets: [] });
    await render(<OcrTestLabScreen />);

    await fireEvent.press(screen.getByText('FROM GALLERY'));
    await waitFor(() => expect(screen.getByDisplayValue('Recognized result')).toBeTruthy());
    recognizeWithTesseract.mockClear();

    await fireEvent.press(screen.getByText('GALLERY — SELECT AND CROP'));
    await waitFor(() => expect(ImagePicker.launchImageLibraryAsync).toHaveBeenLastCalledWith({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    }));
    expect(screen.getByDisplayValue('Recognized result')).toBeTruthy();
    expect(recognizeWithTesseract).not.toHaveBeenCalled();
  });

  test('ScanTextButton crop cancellation skips OCR and the un-cropped action sends the selected URI', async () => {
    ImagePicker.launchImageLibraryAsync.mockResolvedValueOnce({ canceled: true, assets: [] })
      .mockResolvedValueOnce({ canceled: false, assets: [{ uri: 'file://whole.jpg' }] });
    await render(<ScanTextButton colors={colors} labels={{ button: 'SCAN', resultTitle: 'Result', resultText: 'Edit', append: 'ADD', replace: 'REPLACE', cancel: 'CANCEL' }} onTextChange={jest.fn()} />);

    await fireEvent.press(screen.getByText('SCAN'));
    await fireEvent.press(screen.getByText('GALLERY — SELECT AND CROP'));
    await waitFor(() => expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    }));
    expect(recognizeTextFromImage).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText('SCAN'));
    await fireEvent.press(screen.getByText('FROM PHONE'));
    await waitFor(() => expect(recognizeTextFromImage).toHaveBeenCalledWith('file://whole.jpg', 'all', 'auto', 'original'));
  });
});
