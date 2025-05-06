"use strict";

export default class Cooks {

    container = null;
    dataUrl = null;

    constructor({ containerId = 'cook-container', dataUrl = "cooks.json", ...otherArgs } = {}) {

        this.container = document.getElementById(containerId);
        this.dataUrl = dataUrl;
    }

    build() {

        if (!this.container) {
            console.error("Container not found");
            return;
        }

        if (!this.dataUrl) {
            console.error("Data URL not found");
            return;
        }

        fetch(
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

                this.render(responseJson);
            })
            .catch((error) => {

                console.log(error)
            });
    }

    render(cookData) {

        cookData.roles.forEach(role => {

            const title = document.createElement("h2");
            title.innerText = role.name;

            this.container.appendChild(title);

            const wrapper = document.createElement("div");
            wrapper.classList.add("cook-section-wrapper");

            cookData[role.section].forEach(cook => {
                wrapper.appendChild(this.renderCook(cook));
            });

            this.container.appendChild(wrapper);
        });
    }

    renderCook(cook) {

        const wrapper = document.createElement("div");
        wrapper.classList.add("cook");

        const img = document.createElement("img");
        img.src = cook.image;
        img.alt = cook.name;
        img.loading = "lazy";

        wrapper.appendChild(img);

        return wrapper;
    }
}