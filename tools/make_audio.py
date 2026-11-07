#!/usr/bin/env python3
"""Generate pronunciation audio for every class word and practice sentence.

Run on a Mac (uses the built-in `say` and `afconvert`):
    python3 -I tools/make_audio.py

It reads data/words.txt and data/drills.js, makes one small .m4a per text in
audio/, and writes audio/index.json. The app plays these files and falls back to
the device's own voice for anything missing (e.g. words added in the app).
File names are an FNV-1a hash of the text, so the app and this script agree on them.
Run it again after adding words to words.txt; existing files are kept.
"""
import json, os, re, subprocess, sys, tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'audio')
HAN = re.compile(r'[㐀-鿿]')
# best first; the first one installed is used
PREFERRED = ['Lili (Premium)', 'Lili (Enhanced)', 'Tingting (Premium)', 'Tingting (Enhanced)', 'Yu-shu (Enhanced)', 'Tingting']
RATE = os.environ.get('RATE', '150')  # words per minute; a bit slower than normal for learners


def fnv(text):
    h = 0x811c9dc5
    for b in text.encode('utf-8'):
        h ^= b
        h = (h * 0x01000193) & 0xffffffff
    return '%08x' % h


def pick_voice():
    if os.environ.get('VOICE'):
        return os.environ['VOICE']
    listing = subprocess.run(['say', '-v', '?'], capture_output=True, text=True).stdout
    names = [m.group(1) for m in (re.match(r'^(.*?)\s+zh_CN\s', l) for l in listing.splitlines()) if m]
    for want in PREFERRED:  # e.g. 'Lili (Premium)' matches 'Lili (Premium)' or 'Lili (Premium, Chinesisch …)'
        base, _, quality = want.partition(' (')
        quality = quality.rstrip(')')
        for n in names:
            if n.startswith(base) and (not quality or quality in n) and (quality or '(' not in n or 'China' in n):
                return n
    if names:
        return names[0]
    sys.exit('No Mandarin (zh_CN) voice installed.')


def texts():
    out = []
    with open(os.path.join(ROOT, 'data', 'words.txt'), encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith(('#', '//')):
                continue
            h = line.split('|')[0].strip()
            if HAN.search(h):
                out.append(h)
    js = open(os.path.join(ROOT, 'data', 'drills.js'), encoding='utf-8').read()
    js = js.split('window.NOTES')[0]  # skip the cheat-sheet HTML
    for row in re.findall(r"\[([^\[\]]*?)\]", js):
        items = re.findall(r"'([^']*)'", row)
        if not items:
            continue
        first = items[0]
        if '＿＿' in first and len(items) > 1:      # fill-in / measure word: speak the completed sentence
            out.append(first.replace('＿＿', items[1]))
        elif re.search(r'[。！？]$', first):         # sentences, dialogues, picture sentences
            out.extend(i for i in items if HAN.search(i) and re.search(r'[。！？]$', i))
        elif HAN.search(first) and len(first) <= 4 and len(items) == 4:  # tone-change phrases
            out.append(first)
    seen, res = set(), []
    for t in out:
        t = t.strip()
        if t and t not in seen:
            seen.add(t); res.append(t)
    return res


def main():
    voice = pick_voice()
    os.makedirs(OUT, exist_ok=True)
    items = texts()
    index = {}
    with tempfile.TemporaryDirectory() as tmp:
        for i, t in enumerate(items):
            k = fnv(t)
            index[k] = t
            dst = os.path.join(OUT, k + '.m4a')
            if os.path.exists(dst) and not os.environ.get('FORCE'):
                continue
            aiff = os.path.join(tmp, 'a.aiff')
            subprocess.run(['say', '-v', voice, '-r', RATE, '-o', aiff, t], check=True)
            subprocess.run(['afconvert', '-f', 'm4af', '-d', 'aac', '-b', '48000', aiff, dst], check=True)
            print(f'[{i + 1}/{len(items)}] {t}')
    for f in os.listdir(OUT):  # remove audio that no longer belongs to any text
        if f.endswith('.m4a') and f[:-4] not in index:
            os.remove(os.path.join(OUT, f))
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        json.dump({'voice': voice, 'files': sorted(index)}, f, ensure_ascii=False)
    print(f'{len(index)} audio files with voice "{voice}" in audio/')


if __name__ == '__main__':
    main()
