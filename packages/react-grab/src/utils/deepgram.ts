/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import {
  createClient,
  ListenLiveClient,
  LiveTranscriptionEvents,
} from "@deepgram/sdk";

interface DeepgramTranscriptionOptions {
  apiKey: string;
  model?: string;
  language?: string;
  smartFormat?: boolean;
  onTranscript?: (transcript: string, isFinal: boolean) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Error) => void;
  onSpeechStarted?: () => void;
  onUtteranceEnd?: () => void;
}

interface DeepgramTranscription {
  send: (audioData: ArrayBuffer | Blob) => boolean;
  close: () => void;
  isConnected: () => boolean;
}

interface TranscriptAlternative {
  transcript?: string;
}

interface TranscriptData {
  channel?: {
    alternatives?: TranscriptAlternative[];
  };
  is_final?: boolean;
}

export const createDeepgramTranscription = (
  options: DeepgramTranscriptionOptions,
): DeepgramTranscription | null => {
  const {
    apiKey,
    model = "nova-3",
    language = "en",
    smartFormat = true,
    onTranscript,
    onOpen,
    onClose,
    onError,
    onSpeechStarted,
    onUtteranceEnd,
  } = options;

  if (!apiKey || apiKey.trim() === "") {
    onError?.(new Error("Deepgram API key is required"));
    return null;
  }

  let connectionState: "connecting" | "open" | "closing" | "closed" =
    "connecting";

  let deepgram: any;
  let connection: any;

  try {
    deepgram = createClient(apiKey);
    connection = deepgram.listen.live({
      model,
      language,
      smart_format: smartFormat,
    });
  } catch (error) {
    onError?.(
      error instanceof Error ? error : new Error("Failed to create connection"),
    );
    return null;
  }

  connection.on(LiveTranscriptionEvents.Open, () => {
    connectionState = "open";
    onOpen?.();
  });

  connection.on(LiveTranscriptionEvents.Transcript, (data: TranscriptData) => {
    try {
      const alternative = data.channel?.alternatives?.[0];
      if (alternative?.transcript) {
        onTranscript?.(alternative.transcript, data.is_final ?? false);
      }
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to process transcript"),
      );
    }
  });

  connection.on(LiveTranscriptionEvents.SpeechStarted, () => {
    onSpeechStarted?.();
  });

  connection.on(LiveTranscriptionEvents.UtteranceEnd, () => {
    onUtteranceEnd?.();
  });

  connection.on(LiveTranscriptionEvents.Close, () => {
    connectionState = "closed";
    onClose?.();
  });

  connection.on(LiveTranscriptionEvents.Error, (error: Error) => {
    onError?.(error);
  });

  const send = (audioData: ArrayBuffer | Blob): boolean => {
    if (connectionState !== "open") {
      return false;
    }

    try {
      connection.send(audioData);
      return true;
    } catch (error) {
      onError?.(
        error instanceof Error ? error : new Error("Failed to send audio data"),
      );
      return false;
    }
  };

  const close = () => {
    if (connectionState === "closed" || connectionState === "closing") {
      return;
    }

    connectionState = "closing";
    try {
      connection.requestClose();
    } catch (error) {
      connectionState = "closed";
      onError?.(
        error instanceof Error
          ? error
          : new Error("Failed to close connection"),
      );
    }
  };

  const isConnected = (): boolean => connectionState === "open";

  return { send, close, isConnected };
};
