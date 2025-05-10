window.addEventListener('load', function (ev) {
	let parts = [];
	let layers = [];

	/* relative path to the folder containing part folders */
	const DATA_PATH = "./data/";
	const BASE_ASSET_PATH = "assets/";
	const ASSET_PATH = BASE_ASSET_PATH;

	// DOM Elements
	const loading = document.getElementById("loading");
	let loadingTimer = null;

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
}, false);
