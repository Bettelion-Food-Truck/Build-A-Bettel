# Build-A-Bettel

Bettel Hackrew is a dress up game focused on Gavis Bettel similar to [picrew](https://picrew.me/). This game is built upon [Hackrew](https://github.com/ksadov/hackrew). The game was migrated from simple JS to TS due to the growing complexity of the data structures and logical patterns. Maintenance was going to be a nightmare.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10. This game also has an image color generator which requires Python 3 installed (currently).

## Development server

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Deploying

To deploy the project run:

```bash
ng deploy
```

This will compile your project, clean it, and push it to the branch origin/gh-pages. Set GitHub pages to deploy from this branch's root and the game will be live.

Read more about [Angular deployment](https://angular.dev/tools/cli/deployment).

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.


## Create visual assets

This game uses drawn assets as the different outfit options. Each outfit option, or asset, needs to be a .png file. It also must be the same size as the drawing surface; this game is set to use a size of 1000px by 1000px.

To ensure all items line up correctly when layered, it is suggested to drawn all assets on different layers of the same file. Programs like GIMP or Procreate make this easy. Then when the assets are done, export each layer as a .png with a transparent background.

## File structure

TODO Update

All assets are stored in the `assets` folder in different groups. Each group is known as a part. A part could be a shirt, pants, hair, etc. Every asset, once arranged into part folders, is known as an item. Each part folder can have many items.

All files should be in lowercase only. There should be no spaces. If there is a division between works, use a dash.

## Data structure

TODO Update

The game doesn't know anything about the image assets by itself. It requires the information stored within `assets/data.json`. There are two objects of data within this file: layers and parts.

Layers defines the visual order of the indidual parts. Layers are rendered in order of this array. The first layer is on the bottom and the last layer is on the top.

Parts defines all the individual parts of the character (ie body, ears, shirt, pants, etc). Parts also determines the order of the menu for building the character. Parts at the top of the object are first in the menu.

Parts have the following fields:

- `"folder"`: the name of the folder that will contain the part's visual assets
- `"items"`: the names of the items belonging to the part
- `"colorMode"`: Can be `"fill"`, `"multiply"`, `"manual"` or `null`. See the next section, item variants, for details.
- `"colors"`: 6-character strings containing the the hexcodes of colors.
- `"movement"`: Optional. Structure to define capability and limits of part movement. Sub values are `"x"`, `"y"`, and `"scale"`. X and Y may be true, false, or an object with `"min"` and `"max"`. Min and max are offsets limits. Scale adjusts how much the controls move the part.
- `"noneAllowed"`: `true` if this part is optional, false otherwise
- `"hidePartList"`: `true` to remove the category from the part list. This is used if there is only one option for a body.

Ex:
```
{
  "folder": "ears",
  "items": ["small", "big"],
  "colorMode": "manual",
  "colors": ["FFFFFF", "FFBD6C", "BBDE49"],
  "movement": {
    "x": {
      "min": -50,
      "max": 50
    },
    "y": true,
    "scale": 1
  },
  "noneAllowed": true,
  "hidePartList": false
}
```

## Item variants

TODO Update

In addition to each part having multiple variantions of items, the items themselves can come in multiple colors. Above we mention `"colorMode"` and `"colors"`. These indicate additional variations of each item. If a part has color options, then the `"colorMode"` field determines whether the item files for each color are manually or automatically generated.

To manually create color variants for each item of a part, set `"colorMode`" to `"manual"` and for each item and each color of hexcode `"XXXXXX"`, create a .png `assets/part/item_XXXXXX.png` depicting item in color `XXXXXX`.

To generate color variants automatically, you'll need to run the Python script `generate_colored_images.py`. The script uses files of the form `"assets/part/item.png`" as templates to generate colored versions of each item. If a part has `"colorMode"` `"fill"`, the script fills the template's pixels of RGB value `(123, 123, 123)` with the desired color, preserving alpha. If a part has `"colorMode"` `"multiply"`, the script treats the template as an alpha-preserving multiply layer over the desired color.

This next stage requires Python 3. You will also need to install the python module `PIL` on your system first.

```
pip install pillow
```

Once that is installed, run the command below from the root directory of this game in a terminal.

```
python generate_colored_images.py
```

The script might take a while to run, but at the end you'll have your color variant image files in the correct folders.

## Edit the UI

TODO Update

Easy UI changes can be done by editing index.css; specifically the variables allow for easy updates to colors and images.