# Nopeustesti24

This is a simple web-based implementation of the game [Nopeustesti](https://www.youtube.com/watch?v=mfqy1jFEH2w), in which a player presses buttons in the same order that they light up.

This was largely an exercise in learning the basics of React and StyledComponents. I really don't recommend using React for this kind of a browser-based game. React seems to be very much designed for UI that updates infrequently, not a game that needs to update every frame.

The app is hosted online at: TODO

# Things left undone

Possible areas for improvement:

- Interaction via keyboard, not just mouse
- Toggleable sound effects
- Toggleable music or background ambiance
- Choose from a set of visual themes
- Submit and track high scores using a simple server
- Automated tests

# Build instructions

To run the app locally, clone this repository and run these commands in the root directory:

```
npm i
npx vite
```

To build the app and produce static files, run:

```
npx vite build --base="[base url]"
```

--base="https://files.pineapplemachine.com/public/web/nopeustesti24/"

# Screenshot

![Screenshot of web app](TODO)
