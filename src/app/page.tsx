"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { format, parseISO } from "date-fns";
import { db, type Entry } from "../db";
import { useLiveQuery } from "dexie-react-hooks";
import classNames from "classnames";
import { useTheme } from "@/components/ThemeProvider";
import { ToastContainer, toast, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Define default font/size as constants if they are not meant to be changed by user during session
const DEFAULT_FONT_SIZE = 18;
const DEFAULT_FONT_FAMILY = "system-ui";

export default function Home() {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === 'dark';

  const [selectedEntryId, setSelectedEntryId] = useState<number | null>(null);
  const [text, setText] = useState<string>("");
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [currentFont, setCurrentFont] = useState<string>(DEFAULT_FONT_FAMILY);
  const [currentSize, setCurrentSize] = useState<number>(DEFAULT_FONT_SIZE);
  const [timeRemaining, setTimeRemaining] = useState<number>(900);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [editingTimer, setEditingTimer] = useState<boolean>(false);
  const [backspaceDisabled, setBackspaceDisabled] = useState<boolean>(false);
  const [isFullscreen, setIsFullScreen] = useState<boolean>(false);
  const [timerInput, setTimerInput] = useState<string>("15:00");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [timerPromptVisible, setTimerPromptVisible] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [placeholderText, setPlaceholderText] = useState<string>("");
  const resetTimerRef = useRef<boolean>(false);
  const [lastSetDuration, setLastSetDuration] = useState<number>(900);
  const creatingEntryRef = useRef<boolean>(false);
  const lastSavedTextRef = useRef<string>("");
  const [pendingFocusEntryId, setPendingFocusEntryId] = useState<number | null>(null);

  const entries = useLiveQuery(
    () => db.entries.orderBy('createdAt').reverse().toArray(),
    []
  );

  useEffect(() => {
    if (pendingFocusEntryId !== null && entries && entries.find(e => e.id === pendingFocusEntryId)) {
      const entryToFocus = entries.find(e => e.id === pendingFocusEntryId);
      if (entryToFocus && selectedEntryId === pendingFocusEntryId) {
        if (textAreaRef.current && document.body.contains(textAreaRef.current)) {
          setTimeout(() => {
            textAreaRef.current?.focus({ preventScroll: false });
            console.log(`Focus attempted on new entry via pendingFocus: ${pendingFocusEntryId}`);
          }, 0);
        }
        setPendingFocusEntryId(null);
      } else if (!entryToFocus && selectedEntryId === pendingFocusEntryId) {
        setPendingFocusEntryId(null);
      }
    }
  }, [pendingFocusEntryId, entries, selectedEntryId]);

  useEffect(() => {
    if (entries === undefined) {
      return;
    }

    if (selectedEntryId === null) {
      if (text !== "") setText("");
      if (currentFont !== DEFAULT_FONT_FAMILY) setCurrentFont(DEFAULT_FONT_FAMILY);
      if (currentSize !== DEFAULT_FONT_SIZE) setCurrentSize(DEFAULT_FONT_SIZE);
      if (lastSavedTextRef.current !== "") lastSavedTextRef.current = "";

      if (entries.length > 0) {
        setSelectedEntryId(entries[0].id!);
      } else {
        setPlaceholderText(
          placeholderOptions[Math.floor(Math.random() * placeholderOptions.length)]
        );
      }
    } else {
      if (pendingFocusEntryId === selectedEntryId) {
      }

      const entryToLoad = entries.find(e => e.id === selectedEntryId);
      if (entryToLoad) {
        if (text !== entryToLoad.content) setText(entryToLoad.content);

        const newFont = entryToLoad.font || DEFAULT_FONT_FAMILY;
        if (currentFont !== newFont) setCurrentFont(newFont);

        const newSize = entryToLoad.size || DEFAULT_FONT_SIZE;
        if (currentSize !== newSize) setCurrentSize(newSize);

        if (lastSavedTextRef.current !== entryToLoad.content) lastSavedTextRef.current = entryToLoad.content;

      } else {
        if (entries.length > 0) {
          setSelectedEntryId(entries[0].id!);
        } else {
          setSelectedEntryId(null);
        }
      }
    }
  }, [entries, selectedEntryId, text, currentFont, currentSize, pendingFocusEntryId]);

  const placeholderOptions = [
    "Begin writing",
    "Pick a thought and go",
    "Start typing",
    "What's on your mind",
    "Just start",
    "Type your first thought",
    "Start with one sentence",
    "Just say it",
  ];

  const fontOptions = [
    { name: "System", value: "system-ui" },
    { name: "Lato", value: "Lato" },
    { name: "Arial", value: "Arial" },
    { name: "Serif", value: "Times New Roman" },
  ];

  const fontSizeOptions = [16, 18, 20, 22, 24, 26];

  const createNewEntry = useCallback(async (initialContent: string = "") => {
    if (creatingEntryRef.current) return null;
    creatingEntryRef.current = true;
    let newEntryId: number | null = null;
    try {
      const newEntryData: Entry = {
        content: initialContent,
        createdAt: new Date(),
        updatedAt: new Date(),
        font: DEFAULT_FONT_FAMILY,
        size: DEFAULT_FONT_SIZE,
      };
      const id = await db.entries.add(newEntryData);
      newEntryId = id;

      setSelectedEntryId(id);
      setPendingFocusEntryId(id);

    } catch (error) {
      console.error("Failed to create new entry:", error);
    } finally {
      creatingEntryRef.current = false;
    }
    return newEntryId;
  }, []);

  const updateEntryContent = useCallback(async (id: number, newContent: string) => {
    try {
      await db.entries.update(id, { content: newContent, updatedAt: new Date() });
    } catch (error) {
      console.error("Failed to update entry content:", error);
    }
  }, []);

  const updateEntryStyle = useCallback(async (id: number, font: string, size: number) => {
    try {
      await db.entries.update(id, { font: font, size: size, updatedAt: new Date() });
    } catch (error) {
      console.error("Failed to update entry style:", error);
    }
  }, []);

  const deleteEntry = useCallback(async (idToDelete: number) => {
    if (!entries) return;

    const proceedToDelete = async () => {
      const currentSelectedIdBeforeDelete = selectedEntryId;
      try {
        await db.entries.delete(idToDelete);
        toast.success("Entry deleted!", {
          position: "bottom-center",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: darkMode ? "dark" : "light",
        });

        if (currentSelectedIdBeforeDelete === idToDelete && entries.length === 1 && entries[0].id === idToDelete) {
          setText("");
          setCurrentFont(DEFAULT_FONT_FAMILY);
          setCurrentSize(DEFAULT_FONT_SIZE);
          lastSavedTextRef.current = "";
        }
      } catch (error) {
        console.error("Failed to delete entry:", error);
        toast.error("Failed to delete entry.", {
          position: "bottom-center",
          autoClose: 3000,
          theme: darkMode ? "dark" : "light",
        });
      }
    };

    const ConfirmationToast = ({ closeToast }: { closeToast?: () => void }) => (
      <div className="flex flex-col">
        <p className="mb-2 text-sm">Are you sure you want to delete this entry?</p>
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => {
              proceedToDelete();
              if (closeToast) closeToast();
            }}
            className={`px-3 py-1 text-xs rounded border ${darkMode ? 'bg-red-600 hover:bg-red-700 text-white border-red-700' : 'bg-red-500 hover:bg-red-600 text-white border-red-600'}`}
          >
            Yes, delete
          </button>
          <button
            onClick={closeToast}
            className={`px-3 py-1 text-xs rounded border ${darkMode ? 'bg-gray-600 hover:bg-gray-700 text-gray-200 border-gray-700' : 'bg-gray-200 hover:bg-gray-300 text-gray-700 border-gray-300'}`}
          >
            Cancel
          </button>
        </div>
      </div>
    );

    toast(<ConfirmationToast />, {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      draggable: false,
      closeButton: true,
      theme: darkMode ? "dark" : "light",
      transition: Slide,
    });

  }, [entries, selectedEntryId, darkMode]);

  const selectEntry = (id: number) => {
    if (selectedEntryId !== id) {
      setPendingFocusEntryId(null);
      setSelectedEntryId(id);
    }
  };

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    if (selectedEntryId !== null) {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      debounceTimeoutRef.current = setTimeout(async () => {
        await updateEntryContent(selectedEntryId, newText);
        lastSavedTextRef.current = newText;
      }, 750);
    }
  };

  const shareWithChatGPT = () => {
    const aiChatPrompt = `below is my journal entry. wyt? talk through it with me like a friend. don't therpaize me and give me a whole breakdown, don't repeat my thoughts with headings. really take all of this, and tell me back stuff truly as if you're an old homie.
    
    Keep it casual, dont say yo, help me make new connections i don't see, comfort, validate, challenge, all of it. dont be afraid to say a lot. format with markdown headings if needed.

    do not just go through every single thing i say, and say it back to me. you need to proccess everythikng is say, make connections i don't see it, and deliver it all back to me as a story that makes me feel what you think i wanna feel. thats what the best therapists do.

    ideally, you're style/tone should sound like the user themselves. it's as if the user is hearing their own tone but it should still feel different, because you have different things to say and don't just repeat back they say.

    else, start by saying, "hey, thanks for showing me this. my thoughts:"
        
    my entry:
    ${text}`;

    const encodedText = encodeURIComponent(aiChatPrompt);
    window.open(`https://chat.openai.com/?m=${encodedText}`, "_blank");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const parseTimeInput = (input: string): number => {
    const parts = input.split(":");
    if (parts.length === 2) {
      const mins = parseInt(parts[0], 10) || 0;
      const secs = parseInt(parts[1], 10) || 0;
      return mins * 60 + secs;
    }
    return 900;
  };

  const handleTimerInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTimerInput(e.target.value);
  };

  const handleTimerInputBlur = () => {
    const seconds = parseTimeInput(timerInput);
    setTimeRemaining(seconds);
    setLastSetDuration(seconds);
    setEditingTimer(false);
  };

  const handleTimerInputKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const inputElement = e.currentTarget;
    const cursorPos = inputElement.selectionStart;
    const [currentMinutesStr, currentSecondsStr] = timerInput.split(':');
    let currentMinutes = parseInt(currentMinutesStr, 10) || 0;
    let currentSeconds = parseInt(currentSecondsStr, 10) || 0;

    if (e.key === "Enter") {
      const seconds = parseTimeInput(timerInput);
      setTimeRemaining(seconds);
      setLastSetDuration(seconds);
      setEditingTimer(false);
      inputElement.blur();
      return;
    } else if (e.key === "Escape") {
      setTimerInput(formatTime(timeRemaining));
      setEditingTimer(false);
      inputElement.blur();
      return;
    }

    let valueChanged = false;

    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const increment = e.key === "ArrowUp" ? 1 : -1;
      const colonPos = timerInput.indexOf(':');

      if (cursorPos !== null && colonPos !== -1) {
        if (cursorPos <= colonPos) {
          currentMinutes += increment;
          if (currentMinutes < 0) currentMinutes = 99;
          if (currentMinutes > 99) currentMinutes = 0;
        } else {
          currentSeconds += increment;
          if (currentSeconds < 0) {
            currentSeconds = 59;
            currentMinutes = Math.max(0, currentMinutes - 1);
          }
          if (currentSeconds > 59) {
            currentSeconds = 0;
            currentMinutes = Math.min(99, currentMinutes + 1);
          }
        }
        valueChanged = true;
      }
    }

    if (valueChanged) {
      const newTimerInput = `${currentMinutes.toString().padStart(2, '0')}:${currentSeconds.toString().padStart(2, '0')}`;
      setTimerInput(newTimerInput);
      const totalSeconds = currentMinutes * 60 + currentSeconds;
      setTimeRemaining(totalSeconds);
      setLastSetDuration(totalSeconds);
      setTimeout(() => {
        inputElement.setSelectionRange(cursorPos, cursorPos);
      }, 0);
    }
  };

  const startTimer = () => {
    setTimerPromptVisible(true);

    setTimeout(() => {
      setTimerPromptVisible(false);
      setTimerRunning(true);
      setBackspaceDisabled(true);
      setShowControls(false);
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 1500);
  };

  const stopTimer = () => {
    setTimerRunning(false);
    setBackspaceDisabled(false);
    setShowControls(true);
  };

  const resetTimer = () => {
    if (resetTimerRef.current) return;
    resetTimerRef.current = true;

    setTimeRemaining(lastSetDuration);
    setTimerInput(formatTime(lastSetDuration));

    setTimerRunning(false);
    setBackspaceDisabled(false);
    setShowControls(true);

    setTimeout(() => {
      setTimerRunning(true);
      resetTimerRef.current = false;
    }, 100);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timerRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => prev - 1);
      }, 1000);
    } else if (timerRunning && timeRemaining === 0) {
      setTimerRunning(false);
      setBackspaceDisabled(false);
      setShowControls(true);
      setTimeRemaining(lastSetDuration);
      setTimerInput(formatTime(lastSetDuration));
    } else {
      setBackspaceDisabled(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, timeRemaining, lastSetDuration]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (backspaceDisabled && event.key === "Backspace") {
        event.preventDefault();
      }
    };

    if (backspaceDisabled) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [backspaceDisabled]);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullScreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullScreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleFontChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newFont = event.target.value;
    setCurrentFont(newFont);
    if (selectedEntryId !== null) {
      updateEntryStyle(selectedEntryId, newFont, currentSize);
    }
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setCurrentSize(newSize);
    if (selectedEntryId !== null) {
      updateEntryStyle(selectedEntryId, currentFont, newSize);
    }
  };

  const formatDateForSidebar = (date: Date | string | undefined): string => {
    if (!date) return "";
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date;
      return format(dateObj, "MMM d, h:mm a");
    } catch (e) {
      console.error("Error formatting date:", date, e);
      return "Invalid Date";
    }
  };

  const generatePreview = (content: string): string => {
    return content.replace(/\n/g, " ").trim().slice(0, 40) + (content.length > 40 ? "..." : "");
  };

  const renderSidebar = () => (
    <div className={`w-64 h-full overflow-y-auto flex flex-col border-r transition-colors duration-300 ${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200'
      }`}>
      <div className={`p-4 flex justify-between items-center border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <h2 className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Entries</h2>
        <button
          onClick={() => createNewEntry()}
          className={`p-1 rounded ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-100' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
          title="New Entry"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-grow overflow-y-auto">
        {entries && entries.length > 0 ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => selectEntry(entry.id!)}
              className={`px-4 py-3 border-b cursor-pointer transition-colors duration-150 ${darkMode
                ? `border-gray-700 ${selectedEntryId === entry.id ? 'bg-gray-700' : 'hover:bg-gray-800'}`
                : `border-gray-200 ${selectedEntryId === entry.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`
                }`}
            >
              <div className={`flex justify-between items-center mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'} text-xs`}>
                <span>{formatDateForSidebar(entry.updatedAt)}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteEntry(entry.id!);
                  }}
                  className={`p-1 rounded text-xs opacity-50 hover:opacity-100 ${darkMode ? 'hover:bg-red-700 hover:text-red-200' : 'hover:bg-red-100 hover:text-red-600'}`}
                  title="Delete Entry"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <p className={`text-sm font-medium truncate ${darkMode ? (selectedEntryId === entry.id ? 'text-gray-100' : 'text-gray-300') : (selectedEntryId === entry.id ? 'text-gray-900' : 'text-gray-700')}`}>
                {generatePreview(entry.content) || "Empty Entry"}
              </p>
            </div>
          ))
        ) : (
          <p className={`p-4 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No entries yet.</p>
        )}
      </div>
    </div>
  );

  const renderTimer = () => (
    <div className="relative flex items-center">
      {timerPromptVisible ? (
        <span className={`px-2 py-0.5 rounded text-sm font-semibold ${darkMode ? 'text-yellow-400' : 'text-blue-600'}`}>
          Focus mode starting...
        </span>
      ) : editingTimer ? (
        <input
          aria-label="Edit timer duration (MM:SS)"
          type="text"
          value={timerInput}
          onChange={handleTimerInputChange}
          onBlur={handleTimerInputBlur}
          onKeyDown={handleTimerInputKeyDown}
          className={`w-16 text-center px-1 py-0.5 rounded border text-sm focus:outline-none focus:ring-1 ${darkMode
            ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500'
            : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500'
            }`}
          autoFocus
        />
      ) : (
        <span
          onClick={() => setEditingTimer(true)}
          className={`cursor-pointer px-2 py-0.5 rounded hover:bg-opacity-80 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
          title="Click to edit timer"
        >
          {formatTime(timeRemaining)}
        </span>
      )}
      {!timerPromptVisible && (
        <>
          <button
            onClick={timerRunning ? stopTimer : startTimer}
            className={`ml-2 p-1 rounded ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-100' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
            title={timerRunning ? "Pause Timer" : "Start Timer"}
          >
            {timerRunning ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M5.75 4.75a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V5.5a.75.75 0 00-.75-.75h-1.5zm6.5 0a.75.75 0 00-.75.75v9.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V5.5a.75.75 0 00-.75-.75h-1.5z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            )}
          </button>
          <button
            onClick={resetTimer}
            className={`ml-1 p-1 rounded ${darkMode ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-100' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
            title="Reset Timer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </>
      )}
    </div>
  );

  const renderStyleControls = () => (
    <div className="flex items-center space-x-3">
      <select
        aria-label="Select font family"
        title="Select font family"
        value={currentFont}
        onChange={handleFontChange}
        className={`py-1 px-2 border rounded text-sm focus:outline-none focus:ring-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500'}`}
      >
        {fontOptions.map(font => (
          <option key={font.value} value={font.value}>{font.name}</option>
        ))}
      </select>

      <select
        aria-label="Select font size"
        title="Select font size"
        value={currentSize}
        onChange={handleSizeChange}
        className={`py-1 px-2 border rounded text-sm focus:outline-none focus:ring-1 ${darkMode ? 'bg-gray-700 border-gray-600 text-gray-200 focus:ring-blue-500 focus:border-blue-500' : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500 focus:border-blue-500'}`}
      >
        {fontSizeOptions.map(size => (
          <option key={size} value={size}>{size}px</option>
        ))}
      </select>
    </div>
  );

  const renderWordCountDisplay = () => (
    <div title="Word count" className={`text-xs px-2 py-1 rounded ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {wordCount} {wordCount === 1 ? "word" : "words"}
    </div>
  );

  const renderCurrentTimeDisplay = () => (
    <div title={`Current time: ${currentTime}`} className={`text-xs px-2 py-1 rounded ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
      {currentTime}
    </div>
  );

  const renderShareButtons = () => (
    <div className="flex items-center space-x-2">
      <button
        onClick={shareWithChatGPT}
        disabled={!text.trim()}
        className={`px-2 py-1 text-xs rounded border transition-opacity ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-100'} ${!text.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Discuss with ChatGPT"
      >
        ChatGPT
      </button>
    </div>
  );

  const renderTextArea = () => (
    <div className="flex-grow flex justify-center items-start w-full overflow-y-auto">
      <div className="w-full max-w-3xl h-full">
        <textarea
          ref={textAreaRef}
          value={text}
          onChange={handleTextChange}
          placeholder={placeholderText || "Start writing..."}
          style={{ fontFamily: currentFont, fontSize: `${currentSize}px` }}
          className={classNames(
            "w-full h-full p-8 md:p-12 lg:p-16 resize-none focus:outline-none transition-colors duration-300",
            darkMode ? 'bg-gray-800 text-gray-200 placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400',
            { 'opacity-50': timerRunning && timeRemaining > 0 }
          )}
        />
      </div>
    </div>
  );

  const renderSidebarToggle = () => (
    <button
      onClick={() => setShowSidebar(!showSidebar)}
      className={classNames(
        `absolute top-5 left-5 z-50 p-1 rounded-md transition-all duration-200 ease-in-out`,
        `opacity-50 hover:opacity-100 focus:opacity-100`,
        darkMode
          ? 'text-gray-400 hover:bg-gray-700 focus:bg-gray-700'
          : 'text-gray-500 hover:bg-gray-100 focus:bg-gray-100'
      )}
      title={showSidebar ? "Hide Entries" : "Show Entries"}
    >
      {showSidebar ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      )}
    </button>
  );

  const renderFullscreenButton = () => (
    <button
      onClick={toggleFullScreen}
      className={classNames(
        `absolute top-5 right-5 z-50 p-1 rounded-md transition-all duration-200 ease-in-out`,
        `opacity-50 hover:opacity-100 focus:opacity-100`,
        darkMode
          ? 'text-gray-400 hover:bg-gray-700 focus:bg-gray-700'
          : 'text-gray-500 hover:bg-gray-100 focus:bg-gray-100'
      )}
      title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
    >
      {isFullscreen ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-6 w-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9M20.25 20.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      )}
    </button>
  );

  const renderDarkModeToggle = () => (
    <button
      onClick={toggleTheme}
      className={`p-1 rounded ${darkMode ? 'text-yellow-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200'}`}
      title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {darkMode ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      )}
    </button>
  );

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    const updateClock = () => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true }));
    };
    updateClock();
    const timerId = setInterval(updateClock, 1000);
    return () => clearInterval(timerId);
  }, []);

  const handleManualSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    const currentEntryIdConst = selectedEntryId;
    try {
      if (currentEntryIdConst === null) {
        if (text.trim() === "") {
          console.log("Nothing to save for a new entry.");
          setTimeout(() => setIsSaving(false), 750);
          return;
        }
        const newId = await createNewEntry(text);
        if (newId) {
          console.log("New entry created with current text.");
        } else {
          console.error("Failed to create new entry for manual save.");
          setIsSaving(false);
          return;
        }
      } else {
        await updateEntryContent(currentEntryIdConst, text);
        lastSavedTextRef.current = text;
        console.log("Entry saved manually.");
      }
    } catch (error) {
      console.error("Manual save failed:", error);
    } finally {
      setTimeout(() => setIsSaving(false), 750);
    }
  };

  const hasUnsavedChanges = selectedEntryId !== null && text !== lastSavedTextRef.current;
  const canSave = !isSaving && (text.trim() !== "" || selectedEntryId !== null) && (selectedEntryId === null ? text.trim() !== "" : hasUnsavedChanges);

  const renderSaveButton = () => {
    return (
      <button
        onClick={handleManualSave}
        disabled={!canSave || isSaving}
        className={classNames(
          `p-1 rounded transition-all duration-150 ease-in-out flex items-center justify-center`,
          darkMode
            ? 'text-gray-300 hover:bg-gray-700 active:bg-gray-600'
            : 'text-gray-500 hover:bg-gray-100 active:bg-gray-200',
          isSaving
            ? 'bg-green-500 dark:bg-green-600 text-white dark:text-gray-100'
            : (canSave ? '' : 'opacity-50 cursor-not-allowed')
        )}
        title={isSaving ? "Saving..." : (canSave ? "Save current changes" : (text.trim() === "" && selectedEntryId === null ? "Nothing to save" : "No changes to save"))}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
          <path d="M3 3.5A1.5 1.5 0 014.5 2h6.879a1.5 1.5 0 011.06.44l4.122 4.12A1.5 1.5 0 0117 7.622V16.5a1.5 1.5 0 01-1.5 1.5h-11A1.5 1.5 0 013 16.5v-13z" />
          <path d="M5 12.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zM10.5 12a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2zM5.5 2a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2z" />
        </svg>
      </button>
    );
  };

  return (
    <div
      className={classNames(
        "flex h-screen w-screen font-sans overflow-hidden",
        { "transition-opacity duration-500": !showControls }
      )}
      style={{ fontFamily: DEFAULT_FONT_FAMILY }}
    >
      <ToastContainer limit={3} />
      <div className={classNames(
        "transition-all duration-300 ease-in-out",
        showSidebar ? "w-64 flex-shrink-0" : "w-0 flex-shrink-0"
      )}>
        {showSidebar && renderSidebar()}
      </div>

      <div className="flex-grow flex flex-col relative">
        <div className="pt-16 flex-grow flex flex-col items-center w-full">
          {renderSidebarToggle()}
          {renderFullscreenButton()}

          {renderTextArea()}
        </div>

        <div className={classNames(
          "absolute bottom-0 left-0 right-0 p-2 sm:p-4 border-t flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:justify-between sm:items-center transition-all duration-300 ease-in-out",
          darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
        )}>
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-2 sm:space-x-4">
            {renderTimer()}
            {renderStyleControls()}
            {renderWordCountDisplay()}
            {renderSaveButton()}
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-x-2 gap-y-2 sm:space-x-3">
            {renderCurrentTimeDisplay()}
            {renderShareButtons()}
            {renderDarkModeToggle()}
          </div>
        </div>
      </div>
    </div>
  );
}
