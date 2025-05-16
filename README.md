# Build-A-Bettel

Bettel Hackrew is a dress up game focused on Gavis Bettel similar to [picrew](https://picrew.me/). This game is built upon [Hackrew](https://github.com/ksadov/hackrew). The game was migrated from simple JS to TS due to the growing complexity of the data structures and logical patterns. Maintenance was going to be a nightmare.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.10. This game also has an image color generator which requires Python 3 installed (currently).

## Development

Start off by [installing Angular](https://angular.dev/installation). This is the framework that the game runs on. It helps to keep the files separate and clean to understand while compressing them into a small file load for the end user upon deployment.

Next clone the repository to your local machine. Once it is down, run:

```bash
npm install
```

This will install all the libraries and get it functional.

To start a local development server, run:

```bash
npm start
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

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

The file structure is not simple at first glance but hopefully makes sense. There are two primary folders when updating Assets in the game.

The first is the `data` folder located at `app\data`. This holds the major static data for the game. This includes the layers the game draws on, the listing of all the parts, prompts, outfits, and creator credits. These items are updated less frequently but are directly imported into the game code.

The second is the `assets` folder located at `app\assets`. This holds all the more dynamic imagery and data files. It has three subfolders, each dedicated to a single type of asset. These are `contributors`, `outfits`, and `parts`. These are hopefully self explanitory.

 * The `contributors` folder holds the 'employee photos'.
 * The `outfits` folder holds the completed outfit preview images.
 * The `parts` folder holds each and every individual item that the game can display.

The parts are each in different folders. Each part is a different group of assets that can be displayed, usually grouped by type like pants or shirts. To keep things cross browser and platform compatible, every item in these folders should be lower case only with no spaces (dashes are fine).

All images will work without additional settings as png files. In this case, all primary data files should have the setting `webP` (or a variant there of) set to `false`. If all the images in a section have both png and webp versions, then set the value of `webP` in the JSON file to `true`. The code will attempt to use the webP versions first; this will save a lot in terms of file transfer sizes and thus speed up the game rendering. If you are confident that your target audience will all be capable of using webP files, then you do not need to include the fallback png files.

**Note**: Small images, like the icons, do not benefit from webP file format and are not included in this feature.

In each part folder, there are two subfolders: `items` and `thumbnails`. The folder `items` contains the item's images that are drawn on the canvas. These should be proper resolution and able to be overlayed directly. The folder `thumbnails` thus contains the thumbnails of these items. Thumbnails are optional and set in the JSON data files.

In the root of each part folder are also two (usually) files; one for the JSON data and one for the icon for the part. The JSON data file structure is described below. The part icon should be a png file. The size of the PNG file is defined in `src\styles.scss` by the CSS variable `--part-control-size`.

## Data structure

The game doesn't know anything about the image assets by itself. It requires the information stored within `app\data\parts.json`. This file tells the game where to look for the main asset image and thumbnail in each part folder as well as what parts there are.

Example
```
{
  "imageWebP": false,
  "thumbnailWebP": false,
  "parts": [
    {
        "name": "Body",
        "folder": "body",
        "layer": "body",
        "items": "items.json",
        "icon": "icon.png",
        "hideFromPartsList": true
    }
  ]
}
```

Each part is defined in the array called `parts`. Parts listed here have the following fields:
 - **name**: The display name for each part. This is used for mouse hover and accessiblity systems. While it is technically optional, it is recommended to be filled out.
 - **folder**: This required field is the name of the folder where the items for this part are stored. See the above section `File Structure` for more information on that arrangement.
 - **layer**: This required field is the layer in which any non-special item will be rendered for this part. These layers are defined in the `src\app\data\layers.json` file. Each layer is just a string so adding, removing, and re-arranging layers is easy as updating the array contained within that file
 - **items**: This required field is the name of the JSON file where the items that belong to this part are defined.
 - **icon**: This required field is the name of the image file that is shown for this part in the game.
 - **hideFromPartsList**: This is an optional field. When `true`, the part will not display in the listing at the top of the control area. This is useful for parts that only have one option or are used to set up other parts (like the body).

TODO Update the information for the items.json file structure in each part folder. Ensure to mark all the options.

- `"colorMode"`: Can be `"fill"`, `"multiply"`, `"manual"` or `null`. See the next section, item variants, for details.
- `"colors"`: 6-character strings containing the the hexcodes of colors.
- `"movement"`: Optional. Structure to define capability and limits of part movement. Sub values are `"x"`, `"y"`, and `"scale"`. X and Y may be true, false, or an object with `"min"` and `"max"`. Min and max are offsets limits. Scale adjusts how much the controls move the part.
- `"noneAllowed"`: `true` if this part is optional, false otherwise

Ex:
```
{
    "movement": {
        "x": true,
        "y": true
    },
    "movement": {
        "x": true,
        "y": true,
        "scale": 0.5
    },
    "movement": {
      "x": {
        "min": -50,
        "max": 50
      },
      "y": true,
      "scale": 1
    },
    "colorMode": "manual",
    "colors": ["FFFFFF", "FFBD6C", "BBDE49"],
    "noneAllowed": true,
    "assumeThumbnails": true,
    "items": [
        {
            "item": "debut-underlayer",
            "hide": true,
            "outfits": [
                "debut",
                "debut-underlayer",
                "daki",
                "deerttel",
                "unchained"
            ],
            "layer": "accessories-front_under-jacket"
            "multilayer": [
                {
                    "item": "second-outfit-jacket-1-back",
                    "layer": "jackets_1_back"
                }
            ],
            "multilayer": [
                {
                    "item": "sims-flat",
                    "layer": "::host",
                    "requires": {
                        "part": "feet",
                        "item": "flat"
                    }
                },
                {
                    "item": "sims-pointed",
                    "layer": "::host",
                    "requires": {
                        "part": "feet",
                        "item": "pointed"
                    }
                }
            ]
            "requires": {
                "part": "feet",
                "item": "pointed"
            }
        }
    ]
}
```

## Item variants

TODO Update after item/color variants is rebuilt.

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

Simple UI changes can be done by editing `src\styles.scss`; specifically the variables allow for easy updates to colors and sizes at the bottom of the file. For more complicated UI updates, you have to look into each component and update the individual component .scss files. It is not recommended unless you are familiar with the Angular framework as well as CSS and SCSS.