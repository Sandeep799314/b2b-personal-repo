"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Bot, User, Sparkles, Minus, Maximize2, List, PlusCircle, Plane, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter, usePathname, useSearchParams } from "next/navigation"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
  isItineraryList?: boolean
  itineraries?: any[]
  options?: { label: string; value: string; icon?: React.ReactNode }[]
}

type ChatStep = 
  | 'idle' 
  | 'awaiting_itinerary_choice' 
  | 'awaiting_itinerary_selection'
  | 'awaiting_cart_choice'
  | 'awaiting_cart_selection'
  | 'awaiting_title_input'
  | 'collecting_event_day'
  | 'collecting_event_date'
  | 'collecting_event_type'
  | 'collecting_activity_fields'
  | 'collecting_flight_fields'
  | 'collecting_hotel_fields'

interface EventData {
  dayIndex: number;
  date?: string;
  category: string;
  fields: Record<string, any>;
  currentFieldIndex: number;
}

export function UniversalChatbot() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [input, setInput] = useState("")
  const [step, setStep] = useState<ChatStep>('idle')
  const [activeItineraryId, setActiveItineraryId] = useState<string | null>(null)
  const [isCartCombo, setIsCartCombo] = useState(false)
  const [eventData, setEventData] = useState<EventData>({
    dayIndex: 0,
    category: '',
    fields: {},
    currentFieldIndex: 0
  })

  // Sync with current URL to know if we are in a builder
  useEffect(() => {
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    setActiveItineraryId(id);
    setIsCartCombo(type === 'cart-combo' || pathname.includes('cart-combo'));
    
    console.log("[DEBUG] Chatbot Context Sync:", { id, type, isCartCombo: type === 'cart-combo' || pathname.includes('cart-combo') });
  }, [searchParams, pathname]);

  const activityFields = [
    { key: 'title', label: 'Activity Name', type: 'text' },
    { key: 'time', label: 'Time (e.g. 10:00 AM)', type: 'text' },
    { key: 'duration', label: 'Duration', type: 'choice', options: ['1 hour', '2 hours', 'Half Day', 'Full Day'] },
    { key: 'location', label: 'Location', type: 'text' },
    { key: 'price', label: 'Price (Numerical value only)', type: 'text' },
    { key: 'currency', label: 'Currency (e.g. INR, USD)', type: 'choice', options: ['INR', 'USD', 'AED', 'EUR'] }
  ]

  const flightFields = [
    { key: 'airlines', label: 'Airline Name', type: 'text' },
    { key: 'flightNumber', label: 'Flight Number', type: 'text' },
    { key: 'fromCity', label: 'From City', type: 'text' },
    { key: 'toCity', label: 'To City', type: 'text' },
    { key: 'time', label: 'Departure Time', type: 'text' },
    { key: 'price', label: 'Flight Price', type: 'text' },
    { key: 'currency', label: 'Currency', type: 'choice', options: ['INR', 'USD', 'AED', 'EUR'] }
  ]

  const hotelFields = [
    { key: 'hotelName', label: 'Hotel Name', type: 'text' },
    { key: 'roomCategory', label: 'Room Category (e.g. Deluxe, Suite)', type: 'text' },
    { key: 'nights', label: 'Number of Nights', type: 'text' },
    { key: 'checkIn', label: 'Check-in Time', type: 'text' },
    { key: 'price', label: 'Price per Night', type: 'text' },
    { key: 'currency', label: 'Currency', type: 'choice', options: ['INR', 'USD', 'AED', 'EUR'] }
  ]

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I'm your AI Travel Assistant. How can I help you build your perfect itinerary today?",
      timestamp: new Date()
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isTyping])

  const fetchItineraries = async (type?: string) => {
    try {
      const response = await fetch("/api/itineraries")
      if (response.ok) {
        const result = await response.json()
        const data = result.data || []
        if (type) {
          return data.filter((it: any) => it.type === type)
        }
        return data
      }
    } catch (error) {
      console.error("Error fetching itineraries:", error)
    }
    return []
  }

  const handleItinerarySelection = (itinerary: any) => {
    const assistantMessage: Message = {
      role: "assistant",
      content: `Opening: ${itinerary.title}... You can now ask me to add items!`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, assistantMessage])
    
    // Redirect logic
    const path = itinerary.type === 'cart-combo' 
      ? `/itinerary/builder?id=${itinerary._id}&type=cart-combo` 
      : `/itinerary/builder?id=${itinerary._id}`;

    setTimeout(() => {
      router.push(path)
      setStep('idle')
    }, 1000)
  }

  const handleSend = async (forcedInput?: string) => {
    const textToSend = forcedInput || input
    if (!textToSend.trim()) return

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date()
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    if (!forcedInput) setInput("")
    setIsTyping(true)

    const lowerInput = textToSend.toLowerCase()

    // --- STEP: EVENT COLLECTION ---

    if (step === 'collecting_event_day') {
      if (isCartCombo) {
        setStep('collecting_event_date');
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Since you're in the Cart Combo Builder, please provide the specific date for this item (e.g., 2026-04-27).",
          timestamp: new Date()
        }]);
        return;
      }
      const dayNum = parseInt(textToSend.match(/\d+/)?.[0] || "1");
      setEventData(prev => ({ ...prev, dayIndex: dayNum - 1 }));
      setStep('collecting_event_type');
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Got it, Day ${dayNum}. What type of item would you like to add?`,
        timestamp: new Date(),
        options: [
          { label: "Hotel", value: "hotel", icon: <Building2 className="w-3 h-3" /> },
          { label: "Activity", value: "activity", icon: <Sparkles className="w-3 h-3" /> },
          { label: "Flight", value: "flight", icon: <Plane className="w-3 h-3" /> }
        ]
      }]);
      return;
    }

    if (step === 'collecting_event_date') {
      setEventData(prev => ({ ...prev, date: textToSend }));
      setStep('collecting_event_type');
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Date set to ${textToSend}. What type of item would you like to add?`,
        timestamp: new Date(),
        options: [
          { label: "Hotel", value: "hotel", icon: <Building2 className="w-3 h-3" /> },
          { label: "Activity", value: "activity", icon: <Sparkles className="w-3 h-3" /> },
          { label: "Flight", value: "flight", icon: <Plane className="w-3 h-3" /> }
        ]
      }]);
      return;
    }

    if (step === 'collecting_event_type') {
      let type = "activity";
      if (lowerInput.includes("hotel") || lowerInput.includes("stay") || lowerInput.includes("room")) type = "hotel";
      else if (lowerInput.includes("flight") || lowerInput.includes("plane")) type = "flight";

      setEventData(prev => ({ ...prev, category: type, currentFieldIndex: 0 }));
      
      let targetStep: ChatStep = 'collecting_activity_fields';
      let firstField = activityFields[0];
      
      if (type === 'hotel') {
        targetStep = 'collecting_hotel_fields';
        firstField = hotelFields[0];
      } else if (type === 'flight') {
        targetStep = 'collecting_flight_fields';
        firstField = flightFields[0];
      }

      setStep(targetStep);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Great! Let's add a ${type}. First, what is the ${firstField.label}?`,
        timestamp: new Date()
      }]);
      return;
    }

    if (step === 'collecting_activity_fields' || step === 'collecting_flight_fields' || step === 'collecting_hotel_fields') {
      let fields = activityFields;
      if (step === 'collecting_flight_fields') fields = flightFields;
      if (step === 'collecting_hotel_fields') fields = hotelFields;

      const currentField = fields[eventData.currentFieldIndex];
      
      const newFields = { ...eventData.fields, [currentField.key]: textToSend };
      const nextIndex = eventData.currentFieldIndex + 1;

      if (nextIndex < fields.length) {
        setEventData(prev => ({ ...prev, fields: newFields, currentFieldIndex: nextIndex }));
        const nextField = fields[nextIndex];
        setIsTyping(false);
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Got it. ${nextField.label}?`,
          timestamp: new Date(),
          options: nextField.type === 'choice' ? nextField.options?.map(o => ({ label: o, value: o })) : undefined
        }]);
      } else {
        // FINISHED COLLECTION
        setIsTyping(false);
        setStep('idle');
        
        // Ensure price is a number and title is set correctly
        const finalPrice = Number(newFields.price) || 0;
        const finalTitle = newFields.hotelName || newFields.title || newFields.airlines || "Untitled Service";

        const finalEventData = {
          ...newFields,
          category: eventData.category,
          title: finalTitle,
          price: finalPrice,
          description: newFields.description || finalTitle || "Added via Chatbot"
        };

        // Dispatch event to builder
        window.dispatchEvent(new CustomEvent('chatbot-add-event', {
          detail: {
            dayIndex: eventData.dayIndex,
            eventData: finalEventData
          }
        }));

        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Perfect! I've added "${finalTitle}" with price ${newFields.currency} ${finalPrice} for you. Anything else?`,
          timestamp: new Date()
        }]);
      }
      return;
    }


    // --- STEP: NAVIGATION INTENTS ---
    const isHomeIntent = lowerInput.includes("home") || lowerInput.includes("dashboard") || lowerInput.includes("main page");
    const isCartComboIntent = lowerInput.includes("cart") || lowerInput.includes("combo builder");
    const isListIntent = lowerInput.includes("list") || lowerInput.includes("all itineraries") || (lowerInput.includes("itinerary") && lowerInput.includes("page"));

    // Title Change Intent
    const isTitleChangeIntent = (lowerInput.includes("title") || lowerInput.includes("naam") || lowerInput.includes("name")) && 
                                (lowerInput.includes("change") || lowerInput.includes("badlo") || lowerInput.includes("update") || lowerInput.includes("set") || lowerInput.includes("rakhdo") || lowerInput.includes("kardo"));

    // Save/Exit Intent
    const isSaveIntent = lowerInput.includes("save") || lowerInput.includes("jama") || lowerInput.includes("surakshit");
    const isExitIntent = (lowerInput.includes("exit") || lowerInput.includes("bahar") || lowerInput.includes("cancel") || lowerInput.includes("close")) && 
                         (lowerInput.includes("bina") || lowerInput.includes("without") || lowerInput.includes("rehnde") || lowerInput.includes("stop"));
    const isSimpleExit = lowerInput.includes("save karke exit") || lowerInput.includes("save and exit") || lowerInput.includes("save and close");

    if (step === 'idle' && (isSaveIntent || isExitIntent || isSimpleExit)) {
      setIsTyping(false);
      
      if (isExitIntent && !isSimpleExit) {
        window.dispatchEvent(new CustomEvent('chatbot-exit'));
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Exiting without saving as requested. Taking you back...",
          timestamp: new Date()
        }]);
        return;
      }

      if (isSaveIntent || isSimpleExit) {
        window.dispatchEvent(new CustomEvent('chatbot-save', { detail: { exitAfterSave: true } }));
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Saving your progress and exiting. Please wait a moment...",
          timestamp: new Date()
        }]);
        return;
      }
    }

    if (step === 'idle' && isTitleChangeIntent && (activeItineraryId || isCartCombo)) {
      // Improved regex to capture title in various formats
      const match = textToSend.match(/(?:to|naam|name|as|is|rakhdo|kardo)\s+["']?([^"'.!?]+)["']?(?:\s+rakhdo|\s+kardo|$)/i) ||
                    textToSend.match(/["']([^"']+)["']/); 
      
      let newTitle = match ? match[1].trim() : null;

      if (newTitle) {
        newTitle = newTitle.replace(/\s+(?:rakhdo|kardo|set|badlo)$/i, "");
      }

      if (newTitle) {
        setIsTyping(false);
        window.dispatchEvent(new CustomEvent('chatbot-update-title', { detail: { title: newTitle } }));
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Sure! I've updated the title to "${newTitle}".`,
          timestamp: new Date()
        }]);
        return;
      } else {
        setIsTyping(false);
        setStep('awaiting_title_input');
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "What would you like the new title to be?",
          timestamp: new Date()
        }]);
        return;
      }
    }

    if (step === 'awaiting_title_input') {
        const newTitle = textToSend.trim();
        setIsTyping(false);
        setStep('idle');
        window.dispatchEvent(new CustomEvent('chatbot-update-title', { detail: { title: newTitle } }));
        setMessages(prev => [...prev, {
          role: "assistant",
          content: `Perfect! I've updated the title to "${newTitle}".`,
          timestamp: new Date()
        }]);
        return;
    }

    if (step === 'idle' && isCartComboIntent) {
      setIsTyping(false);
      setStep('awaiting_cart_choice');
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I can help you with the Cart Combo Builder! Would you like to work on an existing cart/combo or create a completely new one?",
        timestamp: new Date()
      }]);
      return;
    }

    if (step === 'idle' && (isHomeIntent || isListIntent)) {
      setIsTyping(false);
      let targetPath = '/dashboard';
      let targetName = 'Home';

      if (isListIntent) {
        targetPath = '/itinerary';
        targetName = 'Itineraries List';
      }

      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Sure! Taking you to the ${targetName} now...`,
        timestamp: new Date()
      }]);

      setTimeout(() => {
        router.push(targetPath);
      }, 1500);
      return;
    }

    // Handle Cart Choice (Existing vs New)
    if (step === 'awaiting_cart_choice') {
      if (lowerInput.includes("edit") || lowerInput.includes("existing") || lowerInput.includes("purani")) {
        setIsTyping(true);
        const list = await fetchItineraries('cart-combo');
        setIsTyping(false);
        setStep('awaiting_cart_selection');
        
        setMessages(prev => [...prev, {
          role: "assistant",
          content: list.length > 0 
            ? "Here are your existing Cart/Combo items. Which one would you like to edit?" 
            : "You don't have any existing Cart/Combo items yet. Would you like to create a new one instead?",
          timestamp: new Date(),
          isItineraryList: list.length > 0,
          itineraries: list
        }]);
        return;
      } else if (lowerInput.includes("new") || lowerInput.includes("naya") || lowerInput.includes("nai") || lowerInput.includes("banane")) {
        setIsTyping(false);
        setStep('idle');
        setMessages(prev => [...prev, {
          role: "assistant",
          content: "Perfect! Opening a new Cart Combo Builder for you now.",
          timestamp: new Date()
        }]);
        
        setTimeout(() => {
          router.push('/itinerary/builder?type=cart-combo');
        }, 1500);
        return;
      }
    }

    // Handle Cart Selection
    if (step === 'awaiting_cart_selection') {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Please select one of the cart/combo items listed above to continue.",
        timestamp: new Date()
      }]);
      return;
    }

    // Add item intent
    const isAddItemIntent = (lowerInput.includes("add") || lowerInput.includes("daalo") || lowerInput.includes("insert") || lowerInput.includes("put")) && 
        (lowerInput.includes("item") || lowerInput.includes("activity") || lowerInput.includes("flight") || lowerInput.includes("event") || lowerInput.includes("hotel") || lowerInput.includes("stay") || lowerInput.includes("accommodation"));

    if (step === 'idle' && isAddItemIntent) {
      setIsTyping(false)
      setStep('collecting_event_day')
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "I'd be happy to help you add an item! Which day of the itinerary should we add it to?",
        timestamp: new Date()
      }])
      return
    }

    // Itinerary Intent
    if (step === 'idle' && 
        (lowerInput.includes("itinerary") || lowerInput.includes("itinarary")) && 
        (lowerInput.includes("create") || lowerInput.includes("make") || lowerInput.includes("banani") || lowerInput.includes("banane") || lowerInput.includes("new") || lowerInput.includes("build"))) {
      
      setIsTyping(false)
      setStep('awaiting_itinerary_choice')
      const assistantMessage: Message = {
        role: "assistant",
        content: "I can certainly help you with that! Would you like to edit an existing itinerary or create a completely new one?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      return
    }

    // Handle Edit Choice
    if (step === 'awaiting_itinerary_choice' && (lowerInput.includes("edit") || lowerInput.includes("existing") || lowerInput.includes("purani"))) {
      setIsTyping(true)
      const list = await fetchItineraries()
      setIsTyping(false)
      setStep('awaiting_itinerary_selection')
      
      const assistantMessage: Message = {
        role: "assistant",
        content: list.length > 0 
          ? "Here are your existing itineraries. Which one would you like to edit?" 
          : "You don't have any existing itineraries yet. Would you like to create a new one instead?",
        timestamp: new Date(),
        isItineraryList: list.length > 0,
        itineraries: list
      }
      setMessages(prev => [...prev, assistantMessage])
      return
    }

    // Handle New Choice
    if (step === 'awaiting_itinerary_choice' && (lowerInput.includes("new") || lowerInput.includes("nhi") || lowerInput.includes("naya") || lowerInput.includes("nai"))) {
      setIsTyping(false)
      setStep('idle')
      const assistantMessage: Message = {
        role: "assistant",
        content: "Perfect! Opening the itinerary builder for you now. What kind of trip are we planning today?",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, assistantMessage])
      
      setTimeout(() => {
        router.push('/itinerary/builder')
      }, 1500)
      return
    }

    // Default: Send to AI
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.content,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
      } else {
        throw new Error(data.error || "Failed to get AI response")
      }
    } catch (error) {
      console.error("Chat error:", error)
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble connecting to my brain right now. Please check if the GROQ_API_KEY is configured correctly.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <Card className={cn(
          "mb-4 w-[380px] shadow-2xl border-neutral-200 transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
          isMinimized ? "h-[60px]" : "h-[550px]"
        )}>
          {/* Header */}
          <CardHeader className="p-4 bg-gradient-to-r from-amber-400 to-amber-600 text-amber-950 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                <Bot className="w-5 h-5 text-amber-950" />
              </div>
              <div>
                <CardTitle className="text-sm font-black uppercase tracking-widest">Travel AI</CardTitle>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Online & Ready</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-amber-950 hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-amber-950 hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          {!isMinimized && (
            <>
              {/* Messages Area */}
              <CardContent className="flex-1 min-h-0 p-0 bg-neutral-50/50">
                <ScrollArea className="h-full p-4" viewportRef={scrollRef} type="always">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={cn(
                        "flex flex-col max-w-[85%]",
                        msg.role === "user" ? "ml-auto items-end" : "items-start"
                      )}>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                          msg.role === "user" 
                            ? "bg-amber-500 text-white rounded-tr-none font-medium" 
                            : "bg-white border border-neutral-100 text-neutral-800 rounded-tl-none font-medium"
                        )}>
                          {msg.content}
                          
                          {msg.options && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {msg.options.map((opt) => (
                                <Button
                                  key={opt.value}
                                  variant="outline"
                                  size="sm"
                                  className="text-[10px] h-7 px-2 border-amber-200 hover:bg-amber-50 hover:text-amber-700 bg-white"
                                  onClick={() => handleSend(opt.label)}
                                >
                                  {opt.icon && <span className="mr-1">{opt.icon}</span>}
                                  {opt.label}
                                </Button>
                              ))}
                            </div>
                          )}

                          {msg.isItineraryList && msg.itineraries && (
                            <div className="mt-3 space-y-2">
                              {msg.itineraries.map((it) => (
                                <Button
                                  key={it._id}
                                  variant="outline"
                                  size="sm"
                                  className="w-full justify-start text-xs border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                  onClick={() => handleItinerarySelection(it)}
                                >
                                  <List className="w-3 h-3 mr-2 text-amber-500" />
                                  <span className="truncate">{it.title}</span>
                                </Button>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[9px] text-neutral-400 mt-1 uppercase font-bold tracking-tighter">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex items-center gap-2 text-neutral-400">
                        <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                          <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                          <span className="w-1.5 h-1.5 bg-neutral-300 rounded-full animate-bounce" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">AI is thinking...</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Contextual Options */}
              {(step === 'awaiting_itinerary_choice' || step === 'awaiting_cart_choice') && (
                <div className="px-4 py-2 bg-neutral-50 flex gap-2 overflow-x-auto border-t border-neutral-100">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => handleSend("Edit an existing one")}
                  >
                    <List className="w-3 h-3 mr-1" /> Edit Existing
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="rounded-full bg-white border-amber-200 text-amber-700 hover:bg-amber-50"
                    onClick={() => handleSend("Create a new one")}
                  >
                    <PlusCircle className="w-3 h-3 mr-1" /> Create New
                  </Button>
                </div>
              )}

              {/* Input Area */}
              <CardFooter className="p-4 bg-white border-t border-neutral-100">
                <div className="flex w-full items-center space-x-2">
                  <Input
                    placeholder="Type your travel request..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="flex-1 bg-neutral-50 border-neutral-200 focus-visible:ring-amber-500 h-10 text-sm font-medium"
                  />
                  <Button 
                    onClick={() => handleSend()} 
                    size="icon"
                    className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 h-10 w-10 shrink-0"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </>
          )}
        </Card>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-2xl hover:scale-110 transition-all duration-300 hover:shadow-amber-500/40"
        >
          <div className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 border-2 border-white"></span>
          </div>
          <Sparkles className="h-6 w-6" />
        </button>
      )}
    </div>
  )
}
