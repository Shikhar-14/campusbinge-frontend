import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { AudioWaveform, Loader2 } from 'lucide-react';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
  onSaveMessage?: (role: 'user' | 'assistant', content: string, careerData?: any) => Promise<void>;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ onSpeakingChange, onSaveMessage }) => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef<RealtimeChat | null>(null);
  const currentResponseRef = useRef<string>('');
  const currentUserTranscriptRef = useRef<string>('');

  const handleMessage = async (event: any) => {
    if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
      onSpeakingChange?.(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
      onSpeakingChange?.(false);
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      // User speech transcribed
      currentUserTranscriptRef.current = event.transcript;
      if (onSaveMessage && event.transcript) {
        await onSaveMessage('user', event.transcript);
      }
    } else if (event.type === 'response.audio_transcript.delta') {
      // Accumulate AI response text transcript
      currentResponseRef.current += event.delta;
    } else if (event.type === 'response.audio_transcript.done') {
      // AI audio transcript completed
      const responseText = event.transcript || currentResponseRef.current;
      currentResponseRef.current = '';
      
      // Try to parse career data from response
      let careerData = null;
      try {
        const careerMatch = responseText.match(/```json\s*(\[[\s\S]*?\])\s*```/);
        if (careerMatch) {
          careerData = JSON.parse(careerMatch[1]);
        }
      } catch (e) {
        console.log('No career data in response');
      }
      
      if (onSaveMessage && responseText) {
        await onSaveMessage('assistant', responseText, careerData);
      }
    } else if (event.type === 'error') {
      console.error('Realtime API error:', event.error);
      toast({
        title: "Error",
        description: event.error?.message || 'An error occurred',
        variant: "destructive",
      });
    }
  };

  const startConversation = async () => {
    try {
      setIsConnecting(true);
      
      // Fetch user profile from localStorage
      const savedProfile = localStorage.getItem("universityProfile");
      const userProfile = savedProfile ? JSON.parse(savedProfile) : null;
      
      chatRef.current = new RealtimeChat(handleMessage, userProfile);
      await chatRef.current.init();
      setIsConnected(true);
      setIsConnecting(false);
      
      toast({
        title: "Voice chat started",
        description: "You can now speak with Bh.AI",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsConnecting(false);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to start voice chat',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    onSpeakingChange?.(false);
    
    toast({
      title: "Voice chat ended",
      description: "Voice conversation has been closed",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="relative">
      <Button 
        onClick={isConnected ? endConversation : startConversation}
        disabled={isConnecting}
        size="icon"
        variant={isConnected ? "destructive" : "outline"}
        className={`h-[50px] w-[50px] rounded-full transition-all ${
          isConnected && isSpeaking ? 'animate-pulse scale-110' : ''
        } ${isConnected && !isSpeaking ? 'ring-2 ring-primary ring-offset-2' : ''}`}
        title={isConnected ? (isSpeaking ? 'Bh.AI is speaking...' : 'Listening...') : 'Start voice chat'}
      >
        {isConnecting ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <AudioWaveform className={`h-5 w-5 transition-transform ${
            isConnected && isSpeaking ? 'scale-125' : ''
          }`} />
        )}
      </Button>
      
      {/* Animated sound wave rings when AI is speaking */}
      {isConnected && isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-destructive/30 animate-ping" />
          <div className="absolute inset-0 rounded-full bg-destructive/20 animate-pulse" 
               style={{ animationDuration: '1.5s' }} />
        </>
      )}
      
      {/* Listening indicator when connected but not speaking */}
      {isConnected && !isSpeaking && (
        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default VoiceInterface;
