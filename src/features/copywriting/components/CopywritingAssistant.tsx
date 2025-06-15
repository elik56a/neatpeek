// src/features/copywriting/components/CopywritingAssistant.tsx
"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

// Placeholder types - these would ideally come from Prisma or a shared types file
type CampaignBriefSummary = {
  id: string;
  objective: string;
  // Add other fields you might want to list for selection
};

type GeneratedCopy = {
  platform: string;
  copy: string;
};

const JustGenerateMode: React.FC<{ briefs: CampaignBriefSummary[] }> = ({ briefs }) => {
  const [selectedBriefId, setSelectedBriefId] = useState<string>('');
  const [targetPlatform, setTargetPlatform] = useState<string>(''); // e.g., 'linkedin', 'facebook_post'
  const [generatedCopies, setGeneratedCopies] = useState<GeneratedCopy[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateCopy = async () => {
    if (!selectedBriefId || !targetPlatform) {
      toast({ title: 'Error', description: 'Please select a campaign brief and target platform.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedCopies([]);
    try {
      const response = await fetch('/api/copywriting/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId: selectedBriefId, platform: targetPlatform }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to generate copy');
      }
      const data = await response.json();
      setGeneratedCopies(data.copies);
      toast({ title: 'Success', description: 'Copy generated successfully!' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="briefSelect">Select Campaign Brief</Label>
        <Select value={selectedBriefId} onValueChange={setSelectedBriefId}>
          <SelectTrigger id="briefSelect"><SelectValue placeholder="Choose a brief..." /></SelectTrigger>
          <SelectContent>
            {briefs.map(brief => <SelectItem key={brief.id} value={brief.id}>{brief.objective}</SelectItem>)}
            {briefs.length === 0 && <p className="p-2 text-sm text-muted-foreground">No campaign briefs found.</p>}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="platformSelect">Target Platform</Label>
        <Select value={targetPlatform} onValueChange={setTargetPlatform}>
          <SelectTrigger id="platformSelect"><SelectValue placeholder="Choose a platform..." /></SelectTrigger>
          <SelectContent>
            <SelectItem value="linkedin_post">LinkedIn Post</SelectItem>
            <SelectItem value="facebook_ad_text">Facebook Ad Text</SelectItem>
            <SelectItem value="google_ads_headline">Google Ads Headline</SelectItem>
            <SelectItem value="instagram_caption">Instagram Caption</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleGenerateCopy} disabled={isLoading || !selectedBriefId || !targetPlatform}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Generate Copy
      </Button>
      {generatedCopies.length > 0 && (
        <div className="mt-4 space-y-3">
          <h3 className="font-semibold">Generated Copy:</h3>
          {generatedCopies.map((item, index) => (
            <Card key={index}>
              <CardHeader><CardTitle className="text-base">{item.platform}</CardTitle></CardHeader>
              <CardContent><Textarea readOnly value={item.copy} rows={4} /></CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

type ChatMessage = {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
};

const BrainstormMode: React.FC<{ briefs: CampaignBriefSummary[] }> = ({ briefs }) => {
  const [selectedBriefId, setSelectedBriefId] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;
    if (!selectedBriefId) {
        toast({ title: "Select Brief", description: "Please select a campaign brief to start brainstorming.", variant: "destructive"});
        return;
    }

    const newUserMessage: ChatMessage = { id: Date.now().toString(), sender: 'user', text: userInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, newUserMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/copywriting/brainstorm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ briefId: selectedBriefId, message: userInput, history: chatMessages.slice(-5) }), // Send recent history
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Error in brainstorming session');
      }
      const data = await response.json();
      const aiResponse: ChatMessage = { id: Date.now().toString() + '_ai', sender: 'ai', text: data.reply, timestamp: new Date() };
      setChatMessages(prev => [...prev, aiResponse]);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      const aiErrorResponse: ChatMessage = { id: Date.now().toString() + '_ai_err', sender: 'ai', text: "Sorry, I encountered an error.", timestamp: new Date() };
      setChatMessages(prev => [...prev, aiErrorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="briefSelectChat">Select Campaign Brief (for context)</Label>
        <Select value={selectedBriefId} onValueChange={setSelectedBriefId}>
          <SelectTrigger id="briefSelectChat"><SelectValue placeholder="Choose a brief..." /></SelectTrigger>
          <SelectContent>
             {briefs.map(brief => <SelectItem key={brief.id} value={brief.id}>{brief.objective}</SelectItem>)}
             {briefs.length === 0 && <p className="p-2 text-sm text-muted-foreground">No campaign briefs found.</p>}
          </SelectContent>
        </Select>
      </div>
      <Card className="h-[400px] flex flex-col">
        <CardContent className="flex-grow overflow-y-auto p-4 space-y-3">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-2 rounded-lg max-w-[70%] ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && <div className="flex justify-start"><Loader2 className="h-5 w-5 animate-spin text-gray-400" /></div>}
        </CardContent>
        <CardFooter className="p-2 border-t">
          <div className="flex w-full space-x-2">
            <Textarea
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
              className="resize-none"
              disabled={isLoading || !selectedBriefId}
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !userInput.trim() || !selectedBriefId}>Send</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};


export const CopywritingAssistant: React.FC<{initialBriefs: CampaignBriefSummary[]}> = ({ initialBriefs }) => {
  // In a real app, briefs might be fetched here or passed down if already available
  const [briefs] = useState<CampaignBriefSummary[]>(initialBriefs);


  return (
    <Tabs defaultValue="generate" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="generate">Just Generate</TabsTrigger>
        <TabsTrigger value="brainstorm">Let's Brainstorm</TabsTrigger>
      </TabsList>
      <TabsContent value="generate">
        <Card>
          <CardHeader>
            <CardTitle>Just Generate Copy</CardTitle>
            <CardDescription>Select a campaign brief and target platform to instantly generate copy suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <JustGenerateMode briefs={briefs} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="brainstorm">
        <Card>
          <CardHeader>
            <CardTitle>Brainstorm Copy Ideas</CardTitle>
            <CardDescription>Chat with the AI to refine your copy, explore different angles, and get tailored suggestions.</CardDescription>
          </CardHeader>
          <CardContent>
            <BrainstormMode briefs={briefs} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
