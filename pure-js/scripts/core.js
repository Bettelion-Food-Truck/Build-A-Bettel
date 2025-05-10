window.addEventListener('load', function (ev) {
	let parts = [];

	/* relative path to the folder containing part folders */
	const BASE_ASSET_PATH = "assets/";

	// DOM Elements
	const loading = document.getElementById("loading");
	let loadingTimer = null;

	const itemsButton = document.getElementById("items_button");
	const paletteButton = document.getElementById("palette_button");
	const moveButton = document.getElementById("move_button");

	const paletteList = document.getElementById("color_palette_list");

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

	init();

	async function init() {

		showLoading(0);

		initButtons();
		initCanvases()

		initPalette();

		// part is selected
		await updateSelectedPart(firstPart);
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
	 * Change the color of the item selected for part[partId] to part[partId].colors[colorId]
	 */
	async function selectColor(partId, colorId) {
		selectedColors[partId] = colorId;

		if (selectedItemIndex[partId] != null) {
			await renderLayerStack();
		}

		return null;
	}
}, false);
