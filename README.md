# 汉字 Practice

A small study app for HSK 1 (HSK标准教程1). It covers lessons 1–9 so far. It runs in any browser on iPhone, iPad, Android, or a computer, and you can add it to your home screen.

## What's inside
- **Flashcards** use spaced repetition: hanzi → meaning, meaning → hanzi, or listen → hanzi.
- **Write** practice checks each stroke as you draw it with a finger or Apple Pencil. There are two modes: Trace (with an outline) and From memory.
- **Drills** match the parts of the midterm: picture/word, write from pinyin, radicals, character structure, fill in the blank, tone changes (不/一/3rd+3rd), stroke count and stroke order, measure words, sentence types, sentence/picture, dialogues, listening, and pinyin spelling rules. A **Mock exam** combines all of them and gives a score.
- **Words** lists all vocabulary with pronunciation and an animated stroke order. **Grammar notes** has cheat sheets for lessons 1–9.

## Adding vocabulary
- **For everyone:** edit `data/words.txt` on GitHub (open the file and click the ✏️ pencil). Each line is `hanzi | pinyin | meaning`, and a new lesson starts with `# 10 | lesson title`. You can type pinyin with numbers (`dian4 nao3`). Everyone gets the new words the next time they open the app online.
- **Just for you:** go to Words → ＋ Add in the app. These words are saved on your device. You can send them to friends with **Share my words**.
- To add exam-style practice sentences, edit `data/drills.js`.

## Notes
- Progress is saved in the browser on each device. Nothing is uploaded.
- Stroke data comes from [Hanzi Writer](https://hanziwriter.org) (MIT). It loads online once and is cached for offline use.
- Pronunciation uses the device's built-in Chinese voice. On iPhone/iPad you can add a Chinese voice under Settings → Accessibility → Spoken Content → Voices.
