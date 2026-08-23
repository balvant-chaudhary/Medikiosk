import { renderHook, act } from '@testing-library/react';
import { useVoice } from '../hooks/useVoice';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('useVoice hook', () => {
  let MockSpeechRecognition;
  let mockSpeechSynthesis;

  beforeEach(() => {
    // Mock SpeechRecognition
    window.SpeechRecognition = class MockSpeechRecognition {
      constructor() {
        this.lang = '';
        this.interimResults = false;
        this.maxAlternatives = 1;
        this.continuous = false;
        this.onresult = null;
        this.onerror = null;
        this.onend = null;
        this.start = vi.fn();
        this.stop = vi.fn();
        this.abort = vi.fn();
        // Save the instance to a global variable for testing
        globalThis.__mockSpeechRecognitionInstance = this;
      }
    };

    // Mock speechSynthesis
    mockSpeechSynthesis = {
      speak: vi.fn((utterance) => {
        // Simulate start and end
        if (utterance.onstart) utterance.onstart();
        setTimeout(() => {
          if (utterance.onend) utterance.onend();
        }, 10);
      }),
      cancel: vi.fn(),
    };
    window.speechSynthesis = mockSpeechSynthesis;
    
    // Mock SpeechSynthesisUtterance
    window.SpeechSynthesisUtterance = class MockSpeechSynthesisUtterance {
      constructor(text) {
        this.text = text;
        this.lang = '';
        this.rate = 1;
        this.pitch = 1;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
      }
    };
  });

  afterEach(() => {
    delete window.SpeechRecognition;
    delete window.webkitSpeechRecognition;
    delete window.speechSynthesis;
    delete window.SpeechSynthesisUtterance;
    vi.clearAllMocks();
  });

  it('initializes with default values and isSupported = true', () => {
    const { result } = renderHook(() => useVoice());
    expect(result.current.isListening).toBe(false);
    expect(result.current.transcript).toBe('');
    expect(result.current.isSpeaking).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.isSupported).toBe(true);
  });

  it('sets isSupported = false if SpeechRecognition is missing', () => {
    delete window.SpeechRecognition;
    const { result } = renderHook(() => useVoice());
    expect(result.current.isSupported).toBe(false);
  });

  it('handles startListening and stopListening correctly', () => {
    const { result } = renderHook(() => useVoice());
    
    act(() => {
      result.current.startListening();
    });

    expect(result.current.isListening).toBe(true);
    expect(globalThis.__mockSpeechRecognitionInstance.start).toHaveBeenCalled();

    act(() => {
      result.current.stopListening();
    });

    // We manually trigger onend since the mock doesn't auto-trigger it on stop()
    act(() => {
      const recognitionInstance = globalThis.__mockSpeechRecognitionInstance;
      if (recognitionInstance.onend) recognitionInstance.onend();
    });

    expect(result.current.isListening).toBe(false);
  });

  it('handles speech recognition results', () => {
    const { result } = renderHook(() => useVoice());
    
    act(() => {
      result.current.startListening();
    });

    const recognitionInstance = globalThis.__mockSpeechRecognitionInstance;

    act(() => {
      if (recognitionInstance.onresult) {
        recognitionInstance.onresult({
          results: [[{ transcript: 'hello world' }]]
        });
      }
    });

    expect(result.current.transcript).toBe('hello world');
  });

  it('handles TTS speak and stopSpeaking', async () => {
    const { result } = renderHook(() => useVoice());
    
    act(() => {
      result.current.speak('hello');
    });

    expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    expect(mockSpeechSynthesis.speak).toHaveBeenCalled();
    
    // Check state during speech
    expect(result.current.isSpeaking).toBe(true);

    act(() => {
      result.current.stopSpeaking();
    });
    
    expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(2);

    // Wait for the simulated setTimeout to finish
    await new Promise(resolve => setTimeout(resolve, 20));
    expect(result.current.isSpeaking).toBe(false);
  });
});
