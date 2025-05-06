# Freewrite Web

![Freewrite](https://i.imgur.com/2ucbtff.gif)

thanks to [farzaa](https://github.com/farzaa/freewrite) for the original freewrite app and for the inspiration
please check out his original [repo](https://github.com/farzaa/freewrite) and the opening text:

"Hi. Welcome to Freewrite :).

Plz read this guide.

I beg of you.

It's 5 min max.

My name is Farza.

I made this app.

This is not a journaling app or a note-taking app.
If you use it for that, you'll probably use it once or twice,
and then never touch it again.

This is a tool purely to help you freewrite.

Freewriting is a writing strategy developed in 1973 — it's where you write continuously for a set time without worrying about grammar, spelling, or anything like that. A pure stream of consciousness.

I picked up freewriting many years ago.

It's led to real breakthroughs — like helping me untangle big feelings around shutting down my last company, reflecting on my relationships, and figuring out what actually matters to me as I continuously figure out the next chapter of life.

Using this app is actually super simple:

1. Think of a topic to write about (ex. a breakup, a struggle at work, a new idea)
2. Click fullscreen
3. Click the timer
4. Start writing. No backspaces allowed. Don't stop writing.

Once the timer is done, it'll fade back in — and you'll know to stop.

That's it.

Some basic rules:

- Again, no backspaces
- No fixing spelling
- Little 5–10s breaks are fine, but try to not stop typing
- No need to stay on the topic you started with — let your mind wander
- No judgment — trust your mind!

It's like your brain is GPT and you just exhaust all the tokens in your head around a particular topic — and by the end, you'll likely feel clearer about whatever it was you were writing about.

I know 15m can sound scary for some. What do you even write about.

If you're new to writing, try this:

Before you start your working day, open this app and do a 15m session answering this simple question: "What am I working on today? Why is that the most important thing for me to work on?"

And don't stop writing for 15 minutes.

This little session is how I planned and prioritized my days for many years.

Do this for 3-days straight.

I find this is an easy way to get into writing.

You'd be surprised how easy it is to get sucked into nonsense right when the day starts — and then end up getting nothing of real value done over the next 8–12 hours.

Often after this planning session, I'm 100x more clear and excited about what I'm about to do — and I usually end up changing what I originally planned, for the better.

If you don't wanna write about work, other starting prompts I use for myself:

- "Today, X happened. And it's got me feeling really down. I think — "
- "I had a new idea around Z today and want to think through it. Basically — "
- "I'm in love. And I just wanna talk about it. So — "
- "I think I wanna pivot some stuff. Here's how I'm thinking about it — "

The starting prompt is everything. So, think on it.

Some people are better at writing about emotions.
Some are better at writing about work or ideas.

Try everything. See what works for you.

Freewriting is the most important skill I picked up in the last 10 years.

It's helped me think through my most difficult life decisions.
It's helped me think through startups in a more thorough way.
It's made me a better partner and friend (I like communicating with letters).
It's helped me be happier (on my down days, I write it all out and feel better).

So that's it! That's the app. I hope freewriting helps you.

I know it's a dumb little app — just a text view with some black text a timer — but, use its ideas properly and it can make a big impact :).

(Or it ends up being dumb and useless for you haha. Find out for yourself!)

– Farza"

## Key Changes in This Version (v1.0.0)

This version marks a significant overhaul of the Freewrite Web application, focusing on more robust data storage, a refined user experience, and several new features:

- **Core Storage Rework:**
  - Replaced `localStorage` with **IndexedDB** (using Dexie.js) for more reliable and scalable client-side storage of your writing entries.
- **Enhanced User Interface & Experience:**
  - **Modernized Icons & Layout:** Updated various icons for a cleaner look and adjusted layout for better usability (e.g., centered writing canvas, padded text area).
  - **Streamlined Functionality:** Removed the RTL (Right-to-Left) mode for a more focused experience.
  - **Subtle Controls:** Sidebar and Fullscreen toggle buttons are now less conspicuous.
  - **Comprehensive Dark Mode:** Implemented a global dark mode that applies consistently across the entire application, with a theme provider and CSS variables.
  - **Centered Writing Area:** The main text area is now centered with a maximum width for improved readability on wider screens.
  - **Responsive Bottom Bar:** The main controls bar at the bottom of the screen is now responsive, stacking and wrapping elements gracefully on smaller devices.
- **New Features:**
  - **Manual Save Button:** Added a dedicated save button (floppy disk icon) allowing users to explicitly save their work. The button provides visual feedback and indicates unsaved changes.
  - **Word Count:** Real-time word count display.
  - **Current Time Display:** Shows the current time, formatted in 12-hour AM/PM.
  - **Toast Notifications:** Implemented `react-toastify` for non-intrusive notifications, including a confirmation step for deleting entries.
  - **Default System Font:** The default font is now "system-ui" for a native feel.
- **Bug Fixes & Refinements:**
  - Addressed a bug where deleting the last entry could cause it to reappear.
  - Fixed an issue where typed characters might not immediately show up in the text area.
  - Significantly improved the new entry creation flow to ensure the new entry is reliably focused.
  - Enhanced timer input to allow granular control (MM:SS) using arrow keys.
  - Removed "Discuss with Claude" (retaining ChatGPT integration) and the "Random Font & Size" button for a cleaner interface.
  - Resolved linter errors for cleaner code.

## Features

This web-based version of Freewrite (v1.0.0) offers:

- **Distraction-Free Writing:** A clean, minimalist interface to help you focus on your thoughts.
- **Robust Client-Side Storage:** Entries are saved locally in your browser using IndexedDB, managed by Dexie.js.
- **Entry Management:**
  - Easily create new entries.
  - Navigate entries via a collapsibble sidebar, showing timestamps (12-hour AM/PM format) and content previews.
  - Delete entries with a confirmation prompt (toast notification).
- **Customizable Writing Experience:**
  - Choose from a selection of font families (defaults to "system-ui").
  - Adjust font sizes to your preference.
  - Toggle between Dark and Light mode.
  - Enter Fullscreen mode for an immersive writing environment.
- **Focus Timer:**
  - Set a countdown timer for focused writing sessions.
  - Input duration in MM:SS format, with arrow key support for quick adjustments.
  - Backspace key is disabled while the timer is active to encourage continuous writing.
- **Helpful Information:**
  - Live word count.
  - Current time display (12-hour AM/PM).
- **Manual Save:** A dedicated save button with visual cues for unsaved changes.
- **AI-Powered Reflection:**
  - Send your current entry to ChatGPT with a pre-defined prompt to help you reflect and gain new perspectives.
- **Responsive Design:** Adapts to different screen sizes for a consistent experience on desktop and mobile devices.

## How to Use

1. **Start Writing:** Simply begin typing in the main text area. Your work is automatically debounced and saved to IndexedDB. You can also use the manual save button.
2. **Manage Entries:**
    - Click the hamburger icon (top-left) to toggle the sidebar.
    - Use the `+` button in the sidebar to create a new entry.
    - Click an entry in the sidebar to open it.
    - Delete an entry by clicking the small trash icon next to it in the sidebar (a confirmation will appear).
3. **Customize Your View:**
    - Use the font family and font size dropdowns in the bottom controls.
    - Toggle Dark/Light mode using the sun/moon icon.
    - Click the fullscreen icon (top-right) to enter or exit fullscreen mode.
4. **Use the Focus Timer:**
    - Click the time display (e.g., "15:00") in the bottom controls to edit the duration. Use MM:SS format. Arrow keys can be used to increment/decrement minutes or seconds.
    - Click the play icon to start the timer. The backspace key will be disabled.
    - Pause or reset the timer as needed.
5. **Stay Informed:** The live word count and current time are displayed in the bottom controls.
6. **Reflect with AI:** Once you have some text, click the "ChatGPT" button in the bottom-right controls to send your entry for a guided reflection.

## More Tips & Philosophy (from Farzaa, adapted)

Here are a few more thoughts and features to get the most out of Freewrite:

1. **AI Reflection:** Once you finish a freewrite session, click "ChatGPT". It'll push your entry to ChatGPT via a query parameter to help you reflect. The app includes a custom prompt designed to facilitate insightful connections. This can be a powerful way to process your thoughts.

2. **No Distractions:** There is no spellcheck. There is no markdown. This is on purpose. The goal is to let your thoughts flow without interruption.

3. **Font & Mood:** The app defaults to a clean "system-ui" font, but you can choose others like Lato, Arial, or a Serif. Sometimes changing the font and size can help match the mood of your writing. For example, some find a larger, softer font like Lato better for emotional entries, while a more standard Serif might suit analytical thinking.

4. **Entry History:** Click the sidebar toggle (top-left, looks like a hamburger menu) to see your entry history. All entries are saved locally in your browser's IndexedDB, so they are private to you and your current browser.

Remember Farzaa's original links for more context:

- See a bug in the original? Wanna add something? See open issues and requests on the original repo here: <https://github.com/farzaa/freewrite>
- Wanna join your fellow writers? Join: <https://freewrite.io> (click join writing at top).

## Differences from the Original Mac App

This web version, while inspired by Farzaa's original Freewrite Mac app, has key differences:

- **Platform:** Built as a web application using Next.js and React.
- **Data Storage:** Uses the browser's IndexedDB for local storage instead of local files on disk.
- **UI/UX:** Streamlined interface tailored for web and cross-platform compatibility, including a responsive design for mobile devices.
- **Feature Set:** While maintaining the core freewriting philosophy, this version has evolved with features like manual save, word count, current time display, toast notifications, a more configurable timer input, and robust IndexedDB storage.

## Contributing

Contributions to *this version* are welcome! If you want to make an addition or fix a bug:

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

(feel free to also remix and create your own version)
