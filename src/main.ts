interface Item {
    id: string,
    item: string,
    checked: boolean
}


class ListItem implements Item {
    constructor(
        private $_id: string = "",
        private $_item: string = "",
        private $_checked: boolean = false,
    ) { }

    get id(): string {
        return this.$_id;
    }

    set id(id: string) {
        this.$_id = id
    }
    get item(): string {
        return this.$_item;
    }

    set item(item: string) {
        this.$_item = item
    }
    get checked(): boolean {
        return this.$_checked;
    }

    set checked(checked: boolean) {
        this.$_checked = checked
    }
}


// FULL LIST
interface List {
    list: ListItem[];
    load(): void;
    save(): void;
    clearList(): void;
    addItem(itemObj: ListItem): void;
    removeItem(id: string): void;
}

interface PrivateListItem {
    $_id: string;
    $_item: string;
    $_checked: boolean;
}

class FullList implements List {
    static instance: FullList = new FullList();
    private constructor(private _list: ListItem[] = []) { }

    get list(): ListItem[] {
        return this._list;
    }

    load(): void {
        const storedList: string | null = localStorage.getItem("myList");
        if (typeof storedList !== "string") return;

        const parsedList: PrivateListItem[] = JSON.parse(storedList);

        parsedList.forEach(({ $_id, $_item, $_checked }) => {
            const newListItem = new ListItem($_id, $_item, $_checked);
            FullList.instance.addItem(newListItem);
        });
    }

    save(): void {
        localStorage.setItem("myList", JSON.stringify(this._list));
    }

    clearList(): void {
        this._list = [];
        this.save();
    }

    addItem(itemObj: ListItem): void {
        this._list.push(itemObj);
        this.save();
    }

    removeItem(id: string): void {
        this._list = this._list.filter((item) => String(item.id) !== String(id));
        this.save();
    }
}

// LISTTEMPLATE
interface DOMList {
    ul: HTMLUListElement,
    clear(): void,
    render(fullList: FullList): void,
}

class ListTemplate implements DOMList {
    ul: HTMLUListElement;
    static instance: ListTemplate = new ListTemplate();

    private constructor() {
        this.ul = document.getElementById("listItems") as HTMLUListElement;
    }

    clear(): void {
        this.ul.innerHTML = "";
    }

    render(fullList: FullList): void {
        this.clear();
        fullList.list.forEach((item) => {
            // CREATING LI TAG STARTED
            const li = document.createElement("li") as HTMLLIElement;
            li.className = "item";
            // CREATING LI TAG ENDED

            // CREATING INPUT CHECKBOX TAG STARTED
            const check = document.createElement("input") as HTMLInputElement;
            check.type = "checkbox";
            check.id = item.id;
            check.checked = item.checked;
            li.appendChild(check)

            check.addEventListener("change", () => {
                item.checked = !item.checked;
                fullList.save();
            })
            // CREATING INPUT CHECKBOX TAG ENDED

            // CREATING LABEL TAG STARTED
            const label = document.createElement("label") as HTMLLabelElement;
            label.htmlFor = item.id;
            label.textContent = item.item;
            li.appendChild(label)
            // CREATING LABEL TAG ENDED

            // CREATING BUTTON TAG STARTED
            const button = document.createElement("button") as HTMLButtonElement;
            button.className = "button";
            button.textContent = "X";
            li.append(button)

            button.addEventListener("click", () => {
                fullList.removeItem(item.id);
                this.render(fullList);
            })
            // CREATING BUTTON TAG ENDED

            // appending li into UL
            this.ul.appendChild(li);
        })
    }
}

// INIT APP
const initApp = (): void => {
    const fullList = FullList.instance;
    const template = ListTemplate.instance;

    const itemEntryForm = document.getElementById("itemEntryForm") as HTMLFormElement;

    itemEntryForm.addEventListener("submit", (event: SubmitEvent): void => {
        event.preventDefault();

        const input = document.getElementById("newItem") as HTMLInputElement;
        const newEntryText: string = input.value.trim();
        if (!newEntryText.length) {
            alert("input can be empty!")
            return;
        }

        const itemId: number = fullList.list.length ? parseInt(fullList.list[fullList.list.length - 1].id) + 1 : 1;
        const newItem: ListItem = new ListItem(itemId.toString(), newEntryText);

        input.value = "";

        fullList.addItem(newItem);
        template.render(fullList);
    })

    const clearItems = document.getElementById("clearItemsButton") as HTMLButtonElement;

    clearItems.addEventListener("click", (): void => {
        fullList.clearList();
        template.clear();
    })

    fullList.load();
    template.render(fullList);
}

document.addEventListener("DOMContentLoaded", initApp)