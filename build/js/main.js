"use strict";
class ListItem {
    constructor($_id = "", $_item = "", $_checked = false) {
        this.$_id = $_id;
        this.$_item = $_item;
        this.$_checked = $_checked;
    }
    get id() {
        return this.$_id;
    }
    set id(id) {
        this.$_id = id;
    }
    get item() {
        return this.$_item;
    }
    set item(item) {
        this.$_item = item;
    }
    get checked() {
        return this.$_checked;
    }
    set checked(checked) {
        this.$_checked = checked;
    }
}
class FullList {
    constructor(_list = []) {
        this._list = _list;
    }
    get list() {
        return this._list;
    }
    load() {
        const storedList = localStorage.getItem("myList");
        if (typeof storedList !== "string")
            return;
        const parsedList = JSON.parse(storedList);
        parsedList.forEach(({ $_id, $_item, $_checked }) => {
            const newListItem = new ListItem($_id, $_item, $_checked);
            FullList.instance.addItem(newListItem);
        });
    }
    save() {
        localStorage.setItem("myList", JSON.stringify(this._list));
    }
    clearList() {
        this._list = [];
        this.save();
    }
    addItem(itemObj) {
        this._list.push(itemObj);
        this.save();
    }
    removeItem(id) {
        this._list = this._list.filter((item) => String(item.id) !== String(id));
        this.save();
    }
}
FullList.instance = new FullList();
class ListTemplate {
    constructor() {
        this.ul = document.getElementById("listItems");
    }
    clear() {
        this.ul.innerHTML = "";
    }
    render(fullList) {
        this.clear();
        fullList.list.forEach((item) => {
            // CREATING LI TAG STARTED
            const li = document.createElement("li");
            li.className = "item";
            // CREATING LI TAG ENDED
            // CREATING INPUT CHECKBOX TAG STARTED
            const check = document.createElement("input");
            check.type = "checkbox";
            check.id = item.id;
            check.checked = item.checked;
            li.appendChild(check);
            check.addEventListener("change", () => {
                item.checked = !item.checked;
                fullList.save();
            });
            // CREATING INPUT CHECKBOX TAG ENDED
            // CREATING LABEL TAG STARTED
            const label = document.createElement("label");
            label.htmlFor = item.id;
            label.textContent = item.item;
            li.appendChild(label);
            // CREATING LABEL TAG ENDED
            // CREATING BUTTON TAG STARTED
            const button = document.createElement("button");
            button.className = "button";
            button.textContent = "X";
            li.append(button);
            button.addEventListener("click", () => {
                fullList.removeItem(item.id);
                this.render(fullList);
            });
            // CREATING BUTTON TAG ENDED
            // appending li into UL
            this.ul.appendChild(li);
        });
    }
}
ListTemplate.instance = new ListTemplate();
// INIT APP
const initApp = () => {
    const fullList = FullList.instance;
    const template = ListTemplate.instance;
    const itemEntryForm = document.getElementById("itemEntryForm");
    itemEntryForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const input = document.getElementById("newItem");
        const newEntryText = input.value.trim();
        if (!newEntryText.length) {
            alert("input can be empty!");
            return;
        }
        const itemId = fullList.list.length ? parseInt(fullList.list[fullList.list.length - 1].id) + 1 : 1;
        const newItem = new ListItem(itemId.toString(), newEntryText);
        input.value = "";
        fullList.addItem(newItem);
        template.render(fullList);
    });
    const clearItems = document.getElementById("clearItemsButton");
    clearItems.addEventListener("click", () => {
        fullList.clearList();
        template.clear();
    });
    fullList.load();
    template.render(fullList);
};
document.addEventListener("DOMContentLoaded", initApp);
