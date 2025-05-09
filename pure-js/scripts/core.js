window.addEventListener('load', function (ev) {
	let parts = [];
	let layers = [];

	/* relative path to the folder containing part folders */
	const DATA_PATH = "./data/";
	const BASE_ASSET_PATH = "assets/";
	const ASSET_PATH = BASE_ASSET_PATH;

	// DOM Elements
	const canvas = document.getElementById("main-canvas");
	const context = canvas.getContext('2d');

	const WIDTH = canvas.width;
	const HEIGHT = canvas.height;

	const loading = document.getElementById("loading");
	let loadingTimer = null;

	const randomButton = document.getElementById("random_button");

	const componentButton = document.getElementById("component_button");

	const itemsButton = document.getElementById("items_button");
	const paletteButton = document.getElementById("palette_button");
	const moveButton = document.getElementById("move_button");

	const saveButton = document.getElementById("save_button");

	const itemWrapper = document.getElementById("item_list_wrapper");

	const paletteWrapper = document.getElementById("color_palette_wrapper");
	const paletteList = document.getElementById("color_palette_list");

	const movementWrapper = document.getElementById("movement_wrapper");
	const movementControls = {
		"movement": {
			"up": document.getElementById("move_up_button"),
			"left": document.getElementById("move_left_button"),
			"right": document.getElementById("move_right_button"),
			"down": document.getElementById("move_down_button")
		},

		"reset": document.getElementById("move_reset_button")
	};

	/* 2d array of item select button DOM elements */
	const itemsElements = [];

	/* Render layers to this 1st and then canvas so that images render all at
	   once instead of one layer at a time */
	const workingCanvas = document.createElement('canvas');
	workingCanvas.height = HEIGHT;
	workingCanvas.width = WIDTH;
	const workingContext = workingCanvas.getContext('2d');

	// global state variables
	/* Index of part whose menu is currently displayed */
	let selectedPart = 0;

	/* 1d array of colors where selectedColors[i] is the color selected for part i */
	let selectedColors = []

	/* 1d array of indices of items currently selected,
	where selectedItemIndex[i] is the index of the selected item for of part i */
	let selectedItemIndex = []

	/* Array of simple objects for positioning of part i; see DEFAULT_POSITION for structure */
	let selectedPosition = [];
	const DEFAULT_POSITION = {
		"x": 0,
		"y": 0
	};
	const MOVEMENT_BASE = 10; // 10px

	/* 1d array of canvases of items currently selected,
	where layerCanvases[i] depicts the selected item of part i in the selected color */
	const layerCanvases = [];

	init();

	async function init() {

		showLoading(0);

		initButtons();
		initCanvases()

		initPalette();
		initMove();

		// part is selected
		await updateSelectedPart(firstPart);
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

			console.warn(`Part layer not found for ${parts[i].layer}`);

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
				console.warn(`Building layer for ${layers[i].layer}`);
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
		itemsButton.addEventListener('click', showItems);
		paletteButton.addEventListener('click', showPalette);
		moveButton.addEventListener('click', showMove);
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

				paletteList.appendChild(colorElement);
			}
		}

		return null;
	}

	/**
	 * Bind movement buttons to their functions
	 */
	function initMove() {

		movementControls.movement.up.addEventListener('click', moveActiveLayerUp);
		movementControls.movement.down.addEventListener('click', moveActiveLayerDown);
		movementControls.movement.left.addEventListener('click', moveActiveLayerLeft);
		movementControls.movement.right.addEventListener('click', moveActiveLayerRight);

		movementControls.reset.addEventListener('click', resetActiveLayerPosition);

		for (let i = 0; i < parts.length; i++) {

			selectedPosition[i] = {
				"x": DEFAULT_POSITION.x,
				"y": DEFAULT_POSITION.y,
				"scale": DEFAULT_POSITION.scale
			};
		}
	}

	/**
	 * Update UI to visibly select a part and display that part's items
	 * @param {number} partId The id of the selected part
	 */
	async function updateSelectedPart(partId) {

		if (parts[partId].colors.length === 0) {
			paletteButton.style.display = "none";
		} else {
			paletteButton.style.display = "inline-flex";
		}

		if (!parts[partId].movement || Object.keys(parts[partId].movement).length === 0) {
			moveButton.style.display = "none";
		} else {
			moveButton.style.display = "inline-flex";
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

			for (let j = 0; j < itemRange; j++) {

				if (j == itemIndex) {
					itemsElements[i][j].classList.add("selected");
				} else {
					itemsElements[i][j].classList.remove("selected");
				}
			}
		}

		await renderLayerStack();
	}

	/**
	 * Render Images in layerStack to canvas and update save URL
	 */
	async function renderLayerStack() {

		clearCanvas(workingCanvas);
		showLoading();

		checkPartRequirements();

		// Clear layers
		for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
			// Clearing layers is done first because sometimes layers are rendered out of order due to special logics
			// Additional execution time is minimal for data set size

			clearCanvas(layerCanvases[layerIndex]);
		}

		// Render images to layers
		for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {

			const partId = layers[layerIndex].partId;

			if (selectedItemIndex[partId] !== null && selectedItemIndex[partId] !== undefined) {
				await renderItemToCanvas(layerIndex, partId, selectedItemIndex[partId], selectedColors[partId]);
			}
		}

		// Draw layers onto master
		for (let layerIndex = 0; layerIndex < layers.length; layerIndex++) {
			workingContext.drawImage(layerCanvases[layerIndex], 0, 0);
		}

		clearCanvas(canvas);

		hideLoading();

		context.drawImage(workingCanvas, 0, 0);

		await updateSave();
	}

	function showLoading(delay = 500) {

		if (loadingTimer) {
			clearTimeout(loadingTimer);
			loadingTimer = null;
		}

		loadingTimer = setTimeout(function () {
			loading.style.display = "block";
		}, delay);
	}

	function hideLoading() {
		if (loadingTimer) {
			clearTimeout(loadingTimer);
			loadingTimer = null;
		}

		loading.style.display = "none";
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
		saveButton.href = canvas.toDataURL("image/png");
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
	 * Display palette menu, hide others
	 */
	function showPalette() {
		itemWrapper.style.display = "none";
		paletteWrapper.style.display = "flex";
		movementWrapper.style.display = "none";
	}

	/**
	 * Display move menu, hide others
	 */
	function showMove() {
		itemWrapper.style.display = "none";
		paletteWrapper.style.display = "none";
		movementWrapper.style.display = "flex";

		updateMovementButtons();
	}

	/**
	 * Display item menu, hide others
	 */
	function showItems() {
		itemWrapper.style.display = "flex";
		paletteWrapper.style.display = "none";
		movementWrapper.style.display = "none";
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
	 * Set of control functions for moving the active layer around. Each function adjusts the image position settings and then calls renderLayerStack to update the canvas.
	 */
	function moveActiveLayerUp() {

		if (movementControls.movement.up.classList.contains("disabled")) {
			return;
		}

		selectedPosition[selectedPart].y -= MOVEMENT_BASE * getMovementScale();
		checkMoveLimits();

		renderLayerStack();
	}

	function moveActiveLayerDown() {

		if (movementControls.movement.down.classList.contains("disabled")) {
			return;
		}
		selectedPosition[selectedPart].y += MOVEMENT_BASE * getMovementScale();
		checkMoveLimits();

		renderLayerStack();
	}

	function moveActiveLayerLeft() {

		if (movementControls.movement.left.classList.contains("disabled")) {
			return;
		}

		selectedPosition[selectedPart].x -= MOVEMENT_BASE * getMovementScale();
		checkMoveLimits();

		renderLayerStack();
	}

	function moveActiveLayerRight() {

		if (movementControls.movement.right.classList.contains("disabled")) {
			return;
		}

		selectedPosition[selectedPart].x += MOVEMENT_BASE * getMovementScale();
		checkMoveLimits();

		renderLayerStack();
	}

	function resetActiveLayerPosition(render = true) {

		selectedPosition[selectedPart].x = DEFAULT_POSITION.x;
		selectedPosition[selectedPart].y = DEFAULT_POSITION.y;

		if (render) {

			renderLayerStack();
			updateMovementButtons();
		}
	}

	function getMovementScale() {

		const movement = parts[selectedPart].movement;

		return (movement.scale ? movement.scale : 1);

	}

	function checkMoveLimits() {

		const movement = parts[selectedPart].movement;

		if (movement.y.min && selectedPosition[selectedPart].y < movement.y.min) {

			selectedPosition[selectedPart].y = movement.y.min;
		}

		if (movement.y.max && selectedPosition[selectedPart].y > movement.y.max) {

			selectedPosition[selectedPart].y = movement.y.max;
		}

		if (movement.x.min && selectedPosition[selectedPart].x < movement.x.min) {

			selectedPosition[selectedPart].x = movement.x.min;
		}

		if (movement.x.max && selectedPosition[selectedPart].x > movement.x.max) {

			selectedPosition[selectedPart].x = movement.x.max;
		}

		updateMovementButtons();
	}
	/**
	 * End of control functions
	 */

	/**
	 * Enabled/disable movement buttons based on the selected part's movement options
	 */
	function updateMovementButtons() {

		const movement = parts[selectedPart].movement;
		const position = selectedPosition[selectedPart];

		if (movement.y === false) {
			// Axis is disabled, disable buttons

			movementControls.movement.up.classList.add("disabled");
			movementControls.movement.down.classList.add("disabled");
		} else if (Object.keys(movement.y).length === 0) {
			// No limits

			movementControls.movement.up.classList.remove("disabled");
			movementControls.movement.down.classList.remove("disabled");
		} else {
			// Check position vs limits

			if (movement.y.min && position.y <= movement.y.min) {
				movementControls.movement.up.classList.add("disabled");
			} else {
				movementControls.movement.up.classList.remove("disabled");
			}

			if (movement.y.max && position.y >= movement.y.max) {
				movementControls.movement.down.classList.add("disabled");
			} else {
				movementControls.movement.down.classList.remove("disabled");
			}
		}

		if (movement.x === false) {
			// Axis is disabled, disable buttons

			movementControls.movement.left.classList.add("disabled");
			movementControls.movement.right.classList.add("disabled");
		} else if (Object.keys(movement.x).length === 0) {
			// No limits

			movementControls.movement.left.classList.remove("disabled");
			movementControls.movement.right.classList.remove("disabled");
		} else {
			// Check position vs limits

			if (movement.x.min && position.x <= movement.x.min) {
				movementControls.movement.left.classList.add("disabled");
			} else {
				movementControls.movement.left.classList.remove("disabled");
			}

			if (movement.x.max && position.x >= movement.x.max) {
				movementControls.movement.right.classList.add("disabled");
			} else {
				movementControls.movement.right.classList.remove("disabled");
			}
		}
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
							let neededPartFound = false;

							// Locate the item
							if (item.requires.item === "none" && part.noneAllowed) {

								markSelectedItem(
									neededPartIndex,
									0
								);

								neededPartFound = true;
							} else {
								for (let neededItemIndex = 0; neededItemIndex < part.items.length; neededItemIndex++) {

									let itemName = part.items[neededItemIndex];
									if (typeof itemName !== "string") {
										itemName = itemName.item;
									}

									if (itemName === item.requires.item) {

										neededPartFound = true;

										// Select the item
										markSelectedItem(
											neededPartIndex,
											neededItemIndex + (part.noneAllowed ? 1 : 0)
										);
										break;
									}

									// TODO Need to indicate incompatible options
								}
							}

							if (!neededPartFound) {

								console.error("%c Error:", "color:red; font-weight: bold;", `Required item "${item.requires.item}" not found in part "${item.requires.part}"`);
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

		const item = parts[partIndex].items[itemIndex];
		const position = selectedPosition[partIndex];

		// Set color variant item
		const color = (parts[partIndex].colors.length > 0) ?
			"_" + parts[partIndex].colors[colorIndex]
			:
			"";

		if (typeof item === "string") {
			// Simple item

			const imgPath = ASSET_PATH + parts[partIndex].folder + "/" + item + color + ".png";

			await (renderImage(imgPath, layerIndex, position));
		} else {
			// Complex item

			// Set asset folder
			const partLocation = ASSET_PATH + (item.folder ? item.folder : parts[partIndex].folder);

			// Render the base layer
			const imgPath = partLocation + "/" + item.item + color + ".png";

			if (!item.hide) {

				// Special different layer for some items
				if (item.layer) {

					layerIndex = layers.findIndex(layer => layer.layer === item.layer);
				}

				await (renderImage(imgPath, layerIndex, position));
			}

			// Render additional layers
			if (item.multilayer) {

				for (let i = 0; i < item.multilayer.length; i++) {

					const addImgPath = partLocation + "/" + item.multilayer[i].item + color + ".png";
					const addLayerIndex = layers.findIndex(layer => layer.layer === item.multilayer[i].layer);

					await (renderImage(addImgPath, addLayerIndex, position));
				}
			}
		}
	}

	async function renderImage(imgPath, layerIndex, position) {

		if (layerIndex < 0) {
			// Somethings wrong, exit
			return;
		}

		let img = await (loadImage(imgPath));

		clearCanvas(layerCanvases[layerIndex]);

		let ctx = layerCanvases[layerIndex].getContext('2d');
		ctx.save();

		ctx.translate(position.x, position.y);

		ctx.drawImage(img, 0, 0);

		ctx.restore();
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
}, false);
