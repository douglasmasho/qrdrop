# QRDrop

Send a file from one phone to another with no backend, no internet, and no
server. QRDrop reads a file, turns it into a stream of animated QR codes on the
sender's screen, and the receiver's camera scans them back into the file.

Built with Expo and React Native. It carries the Reko design language: Manrope
throughout, a single blue accent, and a calm light canvas.

## Run it

```bash
npm install
npx expo start
```

Scan the QR code from Expo Go (Android/iOS) or press `a` / `i` to open a
simulator. You need **two devices** to try a real transfer: one running Send,
one running Receive.

> The camera does not work in the iOS Simulator or Android emulator — use a
> physical phone for the Receive side.

## How it works

**Sender**

1. Pick a file with the document picker.
2. The file is read as Base64 and split into 800-character chunks.
3. Each chunk becomes a self-describing JSON frame:
   `{ index, total, name, type, data }`.
4. Frames are rendered as QR codes and looped on screen at 1, 3, or 6 fps.

**Receiver**

1. The camera scans QR codes and parses each as a frame.
2. Chunks are stored by index; duplicates are skipped.
3. Progress shows `9 of 14 frames received`.
4. When every frame has arrived, the Base64 is reassembled, written to a temp
   file, and handed to the system share sheet to save or open.

Because every frame carries the total count and file name, the sender loops
forever and the receiver can join or restart at any time.

## Practical limits

QR codes hold a limited amount of data, so this is best for small files.
Anything over ~150 KB triggers a warning: it still works, but the transfer gets
long and needs a steadier hold. Documents, small images, keys, and text files
are the sweet spot.

## Project layout

```
App.js                      Header + Send/Receive tabs, font loading
index.js                    Expo entry
src/theme.js                Colors, Manrope weights, radii (from Reko)
src/components/ui.js        Shared UI: Button, Card, Segmented, Chip, WhyNote, T
src/lib/protocol.js         Frame format, chunking, parsing
src/screens/SendScreen.js   File pick + animated QR
src/screens/ReceiveScreen.js Camera scan + reassembly + share
```
