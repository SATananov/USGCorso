import { fireEvent, render, screen } from '@testing-library/react-native';
import AuthSoftUniDemoScreen from '../../src/auth/AuthSoftUniDemoScreen';

const callbacks = () => ({
  onBack: jest.fn(),
  onLogin: jest.fn(),
  onOpenKnowledge: jest.fn(),
  onOpenAuthLogin: jest.fn(),
  onOpenAuthRegister: jest.fn(),
  onOpenFeature: jest.fn(),
});

describe('SoftUni Exam Demo', () => {
  test('renders all six groups and the configured points', async () => {
    await render(<AuthSoftUniDemoScreen {...callbacks()} />);

    expect(screen.getByText('Navigation and structure')).toBeTruthy();
    expect(screen.getByText('Authentication and sessions')).toBeTruthy();
    expect(screen.getByText('Data and operations')).toBeTruthy();
    expect(screen.getByText('Forms and validation')).toBeTruthy();
    expect(screen.getByText('Native mobile features')).toBeTruthy();
    expect(screen.getByText('Build and presentation')).toBeTruthy();
    expect(screen.getAllByText('20 points')).toHaveLength(3);
    expect(screen.getByText('15 points')).toBeTruthy();
    expect(screen.getByText('25 points')).toBeTruthy();
    expect(screen.getByText('Extra section · no points')).toBeTruthy();
  });

  test('opens and closes an accordion section', async () => {
    await render(<AuthSoftUniDemoScreen {...callbacks()} />);
    const heading = screen.getByText('Navigation and structure');

    await fireEvent.press(heading);
    expect(screen.getByText(/Knowledge → details/)).toBeTruthy();

    await fireEvent.press(heading);
    expect(screen.queryByText(/Knowledge → details/)).toBeNull();
  });

  test('opens the Knowledge list from section 01', async () => {
    const props = callbacks();
    await render(<AuthSoftUniDemoScreen {...props} />);
    await fireEvent.press(screen.getByText('Navigation and structure'));
    await fireEvent.press(screen.getByText('OPEN REAL KNOWLEDGE LIST →'));
    expect(props.onOpenKnowledge).toHaveBeenCalledTimes(1);
  });

  test('offers authentication actions in section 02', async () => {
    const props = callbacks();
    await render(<AuthSoftUniDemoScreen {...props} />);
    await fireEvent.press(screen.getByText('Authentication and sessions'));
    await fireEvent.press(screen.getByText('TEST REAL SIGN IN →'));
    await fireEvent.press(screen.getByText('TEST REGISTRATION →'));
    expect(props.onOpenAuthLogin).toHaveBeenCalledTimes(1);
    expect(props.onOpenAuthRegister).toHaveBeenCalledTimes(1);
  });

  test('sends data and form actions to their existing destinations', async () => {
    const props = callbacks();
    await render(<AuthSoftUniDemoScreen {...props} />);

    await fireEvent.press(screen.getByText('Data and operations'));
    await fireEvent.press(screen.getByText('CREATE — ADD MATERIAL →'));
    await fireEvent.press(screen.getByText('READ — MY MATERIALS →'));
    await fireEvent.press(screen.getByText('COMMUNITY — QUESTIONS & ANSWERS →'));

    expect(props.onOpenFeature).toHaveBeenNthCalledWith(1, 'AddMaterial');
    expect(props.onOpenFeature).toHaveBeenNthCalledWith(2, 'MyMaterials');
    expect(props.onOpenFeature).toHaveBeenNthCalledWith(3, 'CommunityQuestions');

    await fireEvent.press(screen.getByText('Forms and validation'));
    await fireEvent.press(screen.getByText('MATERIAL FORM AND VALIDATION →'));
    expect(props.onOpenFeature).toHaveBeenLastCalledWith('AddMaterial');
  });

  test('sends native-feature actions to existing routes', async () => {
    const props = callbacks();
    await render(<AuthSoftUniDemoScreen {...props} />);
    await fireEvent.press(screen.getByText('Native mobile features'));
    await fireEvent.press(screen.getByText('CAMERA / GALLERY / OCR →'));
    await fireEvent.press(screen.getByText('LOCATION AND MAP →'));
    await fireEvent.press(screen.getByText('ML KIT TRANSLATION — KNOWLEDGE →'));
    await fireEvent.press(screen.getByText('CARE CALENDAR AND HISTORY →'));
    await fireEvent.press(screen.getByText('MY CORSO — PHOTO GESTURES →'));

    expect(props.onOpenFeature.mock.calls.map(([route]) => route)).toEqual([
      'AddMaterial', 'CorsoFriendly', 'MyCorsoCare', 'My Corso',
    ]);
    expect(props.onOpenKnowledge).toHaveBeenCalledTimes(1);
  });
});
