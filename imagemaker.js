window.addEventListener('load', function (ev) {
	let parts = [];
	let layers = [];

	// code below this line controls functionality
	// dw about if you're just editing visual assets

	/* relative path to the folder containing part folders */
	const ASSET_PATH = "assets/"
	const UI_ASSETS = "ui_icons/"

	// DOM Elements
	const canvas = document.getElementById("my-canvas-object");
	const context = canvas.getContext('2d');

	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;

	const randomButton = document.getElementById("random_button");
	const infoButton = document.getElementById("info_button");
	const paletteButton = document.getElementById("palette_button");
	const itemsButton = document.getElementById("items_button");
	const saveButton = document.getElementById("save_button");
	const loading = document.getElementById("loading");
	/* 1d array of part select button DOM elements */
	const partsElements = [];
	/* 2d array of item select button DOM elements */
	const itemsElements = [];

	/* Render layers to this 1st and then canvas so that images render all at
	   once instead of one layer at a time */
	const workingCanvas = document.createElement('canvas');
	workingCanvas.height = HEIGHT;
	workingCanvas.width = WIDTH;
	const workingContext = workingCanvas.getContext('2d');

	// global state variables
	/* Is the extra info screen currently visible? */
	let infoVisible = false;
	/* Index of part whose menu is currently displayed */
	let selectedPart = 0;
	/* 1d array of colors where selectedColors[i] is the color selected for part i */
	let selectedColors = []
	/* 1d array of indices of items currently selected,
	where selectedItemIndex[i] is the index of the selected item for of part i*/
	let selectedItemIndex = []
	/* 1d array of canvases of items currently selected,
	where layerCanvases[i] depicts the selected item of part i in the selected color*/
	const layerCanvases = [];

	init();

	async function init() {
		await initData();

		initButtons();
		initCanvases()

		await initPartsElements();
		await initItemsElements();
		initPalette();

		await initItemFunctions();

		await randomize();

		let firstPart = 0;
		for (let i = 0; i < parts.length; i++) {
			if (parts[i].hidePartList) {
				continue;
			}
			firstPart = i;
			break;
		}
		await updateSelectedPart(firstPart);
	}

	/**
	 * Fetch parts info from data.json and initialize the parts variable.
	 */
	async function initData() {
		const response = await fetch(ASSET_PATH + "data.json");
		const json = await response.json();

		parts = json.parts;

		for (let partIndex = 0; partIndex < parts.length; partIndex++) {

			if (!parts[partIndex].layer) {
				parts[partIndex].layer = parts[partIndex].folder;
			}
		}

		// Build layer data to know which part is associated
		let rawLayers = json.layers;
		layers = []

		for (let layerIndex = 0; layerIndex < rawLayers.length; layerIndex++) {

			partList = parts.map((part, i) => part.layer === rawLayers[layerIndex] ? i : undefined).filter(x => x !== undefined);

			layers[layerIndex] = {
				"layer": rawLayers[layerIndex],
				"partId": partList[0]
			}
		}
	}

	/**
	 * Assign canvases to list of layer canvases
	 */
	function initCanvases() {

		// Create layers noted in data.json
		for (let i = 0; i < layers.length; i++) {

			layerCanvases[i] = initCanvasLayer();
		}

		// Check each part folder has a layer
		for (let i = 0; i < parts.length; i++) {

			if (layers.filter(x => x.layer === parts[i].layer).length > 0) {
				continue;
			}

			// No layer set, assign to the end
			let layerIndex = layers.length;
			layers[layerIndex] = {
				"layer": parts[i].layer,
				"partId": i
			};
			layerCanvases[layerIndex] = initCanvasLayer();
		}

		// Make blank layers in case of missing ones
		for (let i = 0; i < layerCanvases.length; i++) {
			if (typeof layerCanvases[i] === 'undefined') {
				layerCanvases[i] = initCanvasLayer();
			}
		}
	}

	/**
	 * @returns {HTMLCanvasElement} A new canvas element with the dimensions of the main canvas
	 */
	function initCanvasLayer() {

		let canvas = document.createElement('canvas');
		canvas.height = HEIGHT;
		canvas.width = WIDTH;

		return canvas;
	}

	/**
	 * Assign functions to buttons.
	 */
	function initButtons() {
		randomButton.addEventListener('click', randomize);
		infoButton.addEventListener('click', toggleInfo);
		paletteButton.addEventListener('click', showPalette);
		itemsButton.addEventListener('click', showItems);
		return null;
	}

	/**
	 * Create color select DOM elements for every part's colors
	 */
	function initPalette() {

		for (let i = 0; i < parts.length; i++) {

			for (let j = 0; j < parts[i].colors.length; j++) {

				let colorElement = document.createElement('li');
				colorElement.style.backgroundColor = "#" + parts[i].colors[j];
				colorElement.addEventListener('click', function () {
					selectColor(i, j);
				});
				colorElement.id = "color_" + i.toString() + "_" + j.toString();
				colorElement.style.display = "none";
				document.getElementById("colorpalette_list").appendChild(colorElement);
			}
		}

		return null;
	}

	/**
	 * Update UI to visibly select a part and display that part's items
	 * @param {number} partId The id of the selected part
	 */
	async function updateSelectedPart(partId) {

		selectedPart = partId;

		for (let i = 0; i < parts.length; i++) {

			if (i == partId) {
				partsElements[i].classList.add('selected');
			} else {
				partsElements[i].classList.remove('selected');;
			}

			for (let j = 0; j < (parts[i].items.length + Number(parts[i].noneAllowed)); j++) {

				if (i == partId) {
					itemsElements[i][j].style.display = "inline-flex";
				} else {
					itemsElements[i][j].style.display = "none";
				}
			}
		}

		if (parts[partId].colors.length === 0) {
			paletteButton.style.display = "none";
		} else {
			paletteButton.style.display = "inline-flex";
		}

		updatePalette();
		showItems();

		return null;
	}

	/**
	 * Display image with randomly selected items
	 */
	async function randomize() {

		for (let i = 0; i < parts.length; i++) {

			let noneCount = Number(parts[i].noneAllowed);
			let itemRange = parts[i].items.length + noneCount;
			let itemIndex = Math.floor(Math.random() * itemRange);
			let colorRange = parts[i].colors.length;
			let colorIndex = Math.floor(Math.random() * colorRange);
			selectedColors[i] = colorIndex;

			if (noneCount > 0 && itemIndex === 0) {
				selectedItemIndex[i] = null;
			} else {
				selectedItemIndex[i] = itemIndex - noneCount;
			}

			for (j = 0; j < itemRange; j++) {

				if (j == itemIndex) {
					itemsElements[i][j].classList.add("selected");
				} else {
					itemsElements[i][j].classList.remove("selected");
				}
			}
		}

		await renderLayerStack();
		return null;
	}

	/**
	 * Assign item select callback functions to partsElements and itemsElements members
	 */
	async function initItemFunctions() {

		for (let i = 0; i < parts.length; i++) {
			partsElements[i].addEventListener('click', function () {
				updateSelectedPart(i);
			});

			for (let j = 0; j < (parts[i].items.length + Number(parts[i].noneAllowed)); j++) {
				itemsElements[i][j].addEventListener('click', function () {
					updateSelectedItem(i, j);
				});
			}
		}
		return null;
	}

	/**
	 * Render Images in layerStack to canvas and update save URL
	 */
	async function renderLayerStack() {

		clearCanvas(workingCanvas);
		let timer = setTimeout(function () { loading.style.display = "block"; }, 500);

		checkPartRequirements();

		// Render layers
		for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {

			clearCanvas(layerCanvases[layerIndex]);

			const partId = layers[layerIndex].partId;

			if (selectedItemIndex[partId] !== null && selectedItemIndex[partId] !== undefined) {
				await renderItemToCanvas(layerIndex, partId, selectedItemIndex[partId], selectedColors[partId]);
			}
		}

		// Draw layers
		for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
			workingContext.drawImage(layerCanvases[layerIndex], 0, 0);
		}

		clearCanvas(canvas);
		clearTimeout(timer);
		loading.style.display = "none";
		context.drawImage(workingCanvas, 0, 0);
		await updateSave();
		return null;
	}

	/**
	 * Initialize partsElements
	 */
	function initPartsElements() {

		for (let i = 0; i < parts.length; i++) {

			let part = document.createElement('li');
			let partIcon = document.createElement('img');

			let partIconSrc = `${ASSET_PATH}${parts[i].folder}/icon.png`;
			if (parts[i].icon) {
				partIconSrc = `${ASSET_PATH}${parts[i].folder}/${parts[i].icon}.png`;
			}

			partIcon.src = partIconSrc;
			part.appendChild(partIcon);

			part.id = "part_" + i.toString();

			if (parts[i].hidePartList) {
				part.style.display = "none";
			}

			document.getElementById('parts_list').appendChild(part);
			partsElements[i] = part;
		}

		return null;
	}

	/**
	 * Initialize itemsElements
	 */
	function initItemsElements() {

		for (let i = 0; i < parts.length; i++) {
			itemsElements.push([]);

			for (let j = 0; j < parts[i].items.length; j++) {
				itemsElements[i].push(null);
			}
		}

		for (let i = 0; i < parts.length; i++) {

			if (parts[i].noneAllowed) {
				let noneButton = document.createElement('li');
				let noneButtonIcon = document.createElement('img');
				noneButtonIcon.src = ASSET_PATH + UI_ASSETS + "none_button.svg";
				noneButton.appendChild(noneButtonIcon);
				document.getElementById("itemlist_list").appendChild(noneButton);
				noneButton.style.display = "none";
				itemsElements[i][0] = noneButton;
			}

			for (let j = 0; j < parts[i].items.length; j++) {

				let item = document.createElement('li');
				let itemIcon = document.createElement('img');
				let itemName = parts[i].items[j];
				if (typeof itemName !== "string") {
					itemName = itemName.item;
				}

				itemIcon.id = "icon_" + i.toString() + "_" + j.toString();
				itemIcon.src = (ASSET_PATH +
					parts[i].folder + "/" +
					itemName + ".png");
				item.appendChild(itemIcon);
				item.id = "item_" + i.toString() + "_" + j.toString();
				item.style.display = "none";

				document.getElementById("itemlist_list").appendChild(item);

				itemsElements[i][j + Number(parts[i].noneAllowed)] = item;
			}
		}

		return null;
	}

	function clearCanvas(canvas) {
		return (canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height));
	}

	/**
	 * Update UI to visibly select a parts[partId].items[itemId] and render it to the canvas
	 */
	async function updateSelectedItem(partId, itemId) {

		markSelectedItem(partId, itemId);
		await renderLayerStack();
		return null;
	}

	/**
	 * Update UI to visibly select a parts[partId].items[itemId]
	 */
	async function markSelectedItem(partId, itemId) {

		for (let j = 0; j < (parts[partId].items.length + Number(parts[partId].noneAllowed)); j++) {

			if (j == itemId) {
				itemsElements[partId][j].classList.add("selected");
			} else {
				itemsElements[partId][j].classList.remove("selected");
			}
		}

		let selectedNone = (parts[partId].noneAllowed && itemId == 0);

		if (selectedNone) {
			selectedItemIndex[partId] = null;
		} else {
			selectedItemIndex[partId] = itemId - Number(parts[partId].noneAllowed);
		}
	}

	/**
	 * Update download save button with latest version of the canvas
	 */
	async function updateSave() {
		save.href = canvas.toDataURL("image/png");
		return null;
	}

	/**
	 * Force newLayer to wait until an image is fully loaded before assigning it to layerStack
	 *
	 * @path {string} the path to the Image source .png
	 */
	function loadImage(path) {
		return new Promise(resolve => {
			const image = new Image();
			image.addEventListener('load', () => {
				resolve(image);
			});
			image.src = path;
		});
	}

	/**
	 * Display info menu if it's visible, hide it if it's invisible
	 */
	function toggleInfo() {

		let infoWrap = document.getElementById("info_wrap");

		if (infoVisible) {
			infoWrap.style.display = "none";
			infoVisible = false;
			infoButton.textContent = "?";
		} else {
			infoWrap.style.display = "block";
			infoVisible = true;
			infoButton.textContent = "X";
		}
	}

	/**
	 * Display palette of selectedPart
	 */
	function updatePalette() {

		for (let i = 0; i < parts.length; i++) {

			for (let j = 0; j < parts[i].colors.length; j++) {

				if (i === selectedPart) {
					document.getElementById("color_" + i.toString()
						+ "_" + j.toString()).style.display = "inline-block";
				} else {
					document.getElementById("color_" + i.toString()
						+ "_" + j.toString()).style.display = "none";
				}
			}
		}
	}

	/**
	 * Display palette menu, hide item menu
	 */
	function showPalette() {
		document.getElementById("imagemaker_colorpalette").style.display = "flex";
		document.getElementById("imagemaker_itemlist").style.display = "none";
	}

	/**
	 * Display item menu, hide palette menu
	 */
	function showItems() {
		document.getElementById("imagemaker_colorpalette").style.display = "none";
		document.getElementById("imagemaker_itemlist").style.display = "flex";
	}

	/**
	 * Change the color of the item selected for part[partId] to part[partId].colors[colorId]
	 */
	async function selectColor(partId, colorId) {
		selectedColors[partId] = colorId;

		if (selectedItemIndex[partId] != null) {
			await renderLayerStack();
		}

		return null;
	}

	/**
	 * Checks current selections for incompatible parts
	 */
	function checkPartRequirements() {

		// Check for part requirements
		for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {

			const partId = layers[layerIndex].partId;

			if (selectedItemIndex[partId] !== null && selectedItemIndex[partId] !== undefined) {

				const itemIndex = selectedItemIndex[partId];
				const item = parts[partId].items[itemIndex];

				if (typeof item !== "string" && item.requires) {
					// Complex item with a requirement

					// Locate part
					for (let neededPartIndex = 0; neededPartIndex < parts.length; neededPartIndex++) {

						if (parts[neededPartIndex].layer === item.requires.part) {

							const part = parts[neededPartIndex];

							// Locate the item
							for (let neededItemIndex = 0; neededItemIndex < part.items.length; neededItemIndex++) {

								let itemName = part.items[neededItemIndex];
								if (typeof itemName !== "string") {
									itemName = itemName.item;
								}

								if (itemName === item.requires.item) {

									// Select the item
									markSelectedItem(
										neededPartIndex,
										neededItemIndex + (part.noneAllowed ? 1 : 0)
									);
									break;
								}

								// TODO Need to indicate incompatible options
							}
							break;
						}
					}
				}
			}
		}
	}

	/**
	 * Render parts[partIndex].items[itemIndex] (with variants + options) to layerCanvases[layerIndex]
	 */
	async function renderItemToCanvas(layerIndex, partIndex, itemIndex, colorIndex) {

		const partLocation = ASSET_PATH + parts[partIndex].folder;
		const item = parts[partIndex].items[itemIndex];

		// Set color variant item
		const color = (parts[partIndex].colors.length > 0) ?
			"_" + parts[partIndex].colors[colorIndex]
			:
			"";

		if (typeof item === "string") {
			// Simple item

			const imgPath = partLocation + "/" + item + color + ".png";

			await (renderImage(imgPath, layerIndex));
		} else {
			// Complex item

			// Render the base layer
			const imgPath = partLocation + "/" + item.item + color + ".png";

			await (renderImage(imgPath, layerIndex));

			// Render additional layers
			if (item.multilayer) {

				for (let i = 0; i < item.multilayer.length; i++) {

					const addImgPath = partLocation + "/" + item.multilayer[i].item + color + ".png";
					const addLayerIndex = layers.indexOf(item.multilayer[i].layer);

					await (renderImage(addImgPath, addLayerIndex));
				}
			}
		}
	}

	async function renderImage(imgPath, layerIndex) {

		if (layerIndex < 0) {
			// Somethings wrong, exit
			return;
		}

		let img = await (loadImage(imgPath));

		clearCanvas(layerCanvases[layerIndex]);
		let ctx = layerCanvases[layerIndex].getContext('2d');
		ctx.drawImage(img, 0, 0);
	}

}, false);
