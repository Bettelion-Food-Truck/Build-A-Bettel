export class Parts {

    container = null;
    dataUrl = null;

    onItemClick = null;

    dataFetch = null;

    outfitPath = null;
    outfits = [];

    constructor({ onItemClick = null, containerId = 'outfit-list', dataUrl = "outfits.json", ...otherArgs } = {}) {

        this.container = document.getElementById(containerId);
        this.dataUrl = dataUrl;
        this.onItemClick = onItemClick;
    }

    init() {

        if (!this.container) {
            console.error("Container not found");
            return;
        }

        if (!this.dataUrl) {
            console.error("Data URL not found");
            return;
        }


        this.dataFetch = fetch(
            this.dataUrl,
            {
                cache: "no-cache"
            }
        )
            .then((response) => {

                if (response.ok) {

                    return response.json();
                }

                throw new Error(`Unabled to fetch data from ${this.dataUrl}`);
            })
            .then((responseJson) => {

                this.build(responseJson);
            })
            .catch((error) => {

                console.error(error)
            });

    }

    build(data) {

        this.outfitPath = data.path;
        this.outfits = data.outfits;

        // Clear the container
        while (this.container.firstChild) {
            this.container.removeChild(this.container.lastChild);
        }

        // Refill container with new data
        for (let i = 0; i < this.outfits.length; i++) {

            let outfit = this.outfits[i];

            let outfitWrapper = document.createElement('button');
            let outfitIcon = document.createElement('img');
            let outfitLabel = document.createElement('span');

            outfitIcon.id = "outfit_icon_" + i.toString();
            outfitIcon.src = this.outfitPath +
                outfit.uid + ".png";

            outfitIcon.alt = outfit.name ? outfit.name : outfit.uid;
            outfitIcon.loading = "lazy";

            outfitLabel.innerText = outfit.name ? outfit.name : outfit.uid;

            outfitWrapper.appendChild(outfitIcon);
            outfitWrapper.appendChild(outfitLabel);

            outfitWrapper.id = "outfit_" + i.toString();
            outfitWrapper.className = "outfit";

            this.container.appendChild(outfitWrapper);

            this.outfits[i].elem = outfitWrapper;
        }

        this.bindEvents();
    }

    bindEvents() {

        for (let i = 0; i < this.outfits.length; i++) {
            this.outfits[i].elem.addEventListener('click', function () {

                if (this.onItemClick) {

                    this.onItemClick(this.outfits[i].uid);
                } else {

                    console.warn("No outfit click handler defined");
                }
            }.bind(this));
        }
    }

    async getCount() {

        // Await to ensure data is loaded
        if (this.dataFetch != null) {
            await this.dataFetch;
        }

        return this.outfits.length;
    }

    getOutfitUID(index) {

        if (index < 0 || index >= this.outfits.length) {
            return null;
        }

        return this.outfits[index].uid;
    }
}

export class Part {

    name = "";

    layer = null;
    folder = "";

    icon = "icon.png";

    noneAllowed = false;
    hideFromPartsList = false;

    movement = false;

    colorMode = null;
    colors = [];

    items = [];

    constructor({
        name = "Default Part Name",
        layer = null,
        folder = "",
        icon = "icon.png",
        noneAllowed = false,
        hideFromPartsList = false,
        movement = false,
        colorMode = null,
        colors = [],
        items = []
    } = {}) {

        this.name = name;
        this.layer = layer;
        this.folder = folder;
        this.icon = icon;
        this.noneAllowed = noneAllowed;
        this.hideFromPartsList = hideFromPartsList;
        this.movement = movement;
        this.colorMode = colorMode;
        this.colors = colors;
        this.items = items;
    }

    getName() {
        return this.name;
    }

    setName(name) {
        this.name = name;
    }

    getLayer() {
        return this.layer;
    }

    setLayer(layer) {
        this.layer = layer;
    }

    getFolder() {
        return this.folder;
    }

    setFolder(folder) {
        this.folder = folder;
    }

    getIcon() {
        return this.icon;
    }

    setIcon(icon) {
        this.icon = icon;
    }

    getNoneAllowed() {
        return this.noneAllowed;
    }

    setNoneAllowed(noneAllowed) {
        this.noneAllowed = noneAllowed;
    }

    getHideFromPartsList() {
        return this.hideFromPartsList;
    }

    setHideFromPartsList(hideFromPartsList) {
        this.hideFromPartsList = hideFromPartsList;
    }

    getMovement() {
        return this.movement;
    }

    setMovement(movement) {
        this.movement = movement;
    }

    getColorMode() {
        return this.colorMode;
    }

    setColorMode(colorMode) {
        this.colorMode = colorMode;
    }

    getColors() {
        return this.colors;
    }

    setColors(colors) {
        this.colors = colors;
    }

    getItems() {
        return this.items;
    }

    setItems(items) {
        this.items = items;
    }
}