// Disha Sarathi - SilentEngine (Layer A Tap / Visual Fallback Engine)
import { LanguageCode } from '../../core/types';

export class SilentEngine {
  readonly id = 'SilentEngine';
  readonly name = 'On-Device Tap Mode (Silent)';

  isAvailable(): boolean {
    return true;
  }

  startListening(
    _lang: LanguageCode,
    _onResult: any,
    _onError: any,
    onEnd: () => void
  ): void {
    // No-op for silent mode
    setTimeout(onEnd, 100);
  }

  stopListening(): void {}

  speak(_text: string, _lang: LanguageCode, onEnd?: () => void): void {
    // Silent mode completes immediately
    if (onEnd) setTimeout(onEnd, 50);
  }

  stopSpeaking(): void {}
}
