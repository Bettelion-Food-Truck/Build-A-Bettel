# Bettel Hackrew

## Info

Bettel Hackrew is a dress up game focused on Gavis Bettel similar to [picrew](https://picrew.me/). This game is built upon [Hackrew](https://github.com/ksadov/hackrew). To use the image color generator, you will need Python 3 installed. You will also need to run it off a server if you want to use it locally; Python has a good option built in.

## Developing

### Start a web server

This game requires the use of a web server to run. The easiest way to launch it from your own machine is using Python (as the color tool is also built in python).

- Open the command line
- CD into the game directory
- Run the command `python -m http.server`
- Navigate to [http://localhost:8000/](http://localhost:8000/) in a web browser

Success, it runs.

### Create visual assets

This game uses drawn assets as the different outfit options. Each outfit option, or asset, needs to be a .png file. It also must be the same size as the drawing surface; this game is set to use a size of 1000px by 1000px.

To ensure all items line up correctly when layered, it is suggested to drawn all assets on different layers of the same file. Programs like GIMP or Procreate make this easy. Then when the assets are done, export each layer as a .png with a transparent background.

### File structure

All assets are stored in the `assets` folder in different groups. Each group is known as a part. A part could be a shirt, pants, hair, etc. Every asset, once arranged into part folders, is known as an item. Each part folder can have many items.

All files should be in lowercase only. There should be no spaces. If there is a division between works, use a dash.

### Data structure

The game doesn't know anything about the image assets by itself. It requires the information stored within `assets/data.json`. There are two objects of data within this file: layers and parts.

Layers defines the visual order of the indidual parts. Layers are rendered in order of this array. The first layer is on the bottom and the last layer is on the top.

Parts defines all the individual parts of the character (ie body, ears, shirt, pants, etc). Parts also determines the order of the menu for building the character. Parts at the top of the object are first in the menu.

Parts have the following fields:

- `"folder"`: the name of the folder that will contain the part's visual assets
- `"items"`: the names of the items belonging to the part
- `"colorMode"`: Can be `"fill"`, `"multiply"`, `"manual"` or `null`. See the next section, item variants, for details.
- `"colors"`: 6-character strings containing the the hexcodes of colors.
- `"noneAllowed"`: `true` if this part is optional, false otherwise
- `"hidePartList"`: `true` to remove the category from the part list. This is used if there is only one option for a body.

Ex:
```
{
  "folder": "ears",
  "items": ["small", "big"],
  "colorMode": "manual",
  "colors": ["FFFFFF", "FFBD6C", "BBDE49"],
  "noneAllowed": true,
  "hidePartList": false
}
```

### Item variants

In addition to each part having multiple variantions of items, the items themselves can come in multiple colors. Above we mention `"colorMode"` and `"colors"`. These indicate additional variations of each item. If a part has color options, then the `"colorMode"` field determines whether the item files for each color are manually or automatically generated.

To manually create color variants for each item of a part, set `"colorMode`" to `"manual"` and for each item and each color of hexcode `"XXXXXX"`, create a .png `assets/part/item_XXXXXX.png` depicting item in color `XXXXXX`.

To generate color variants automatically, you'll need to run the Python script `generate_colored_images.py`. The script uses files of the form `"assets/part/item.png`" as templates to generate colored versions of each item. If a part has `"colorMode"` `"fill"`, the script fills the template's pixels of RGB value `(123, 123, 123)` with the desired color, preserving alpha. If a part has `"colorMode"` `"multiply"`, the script treats the template as an alpha-preserving multiply layer over the desired color.

You will need to install the python module `PIL` on your system first. Once that is installed, run the command below from the root directory of this game in a terminal.

```
python generate_colored_images.py
```

The script might take a while to run, but at the end you'll have your color variant image files in the correct folders.

### Edit the UI

Easy UI changes can be done by editing index.css; specifically the variables allow for easy updates to colors and images.

## Deploying

Hosting the game is simple. You only need index.html, index.css, imagemaker.js, and the assets folder. Upload these files and the folder to your webhost and all is done. Ensure the file structure remains intact

Hosting on GitHub Pages is even easier, just fork this project, customize as needed, then follow the the intrucutions [about creating a GitHub Pages site](https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site).

## TODO

- Reset button to bring back to blank base
- Remove randomize from init, default to an outfit
- Linked assets
  - Outfits
- Movable assets
- Preview image for asset in cases where it is multi-layer, tiny, or similar
- Integrate some accessibility changes from https://github.com/npz-web/a11y-avatar-creator
- Update generate_colored_images.py to match new file and data structures
- See if there's a way to batch async for faster response time on multi-layer items or item sets
- Zoom feature
- Undo and Redo functions