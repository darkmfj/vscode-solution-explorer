import * as vscode from "vscode";
import { ICommandParameter } from "../base/ICommandParameter";

export type ItemsResolver = () => Promise<string[]>;

export type MapItemsResolver = () => Promise<{ [id: string]: string }>;

export type ItemsOrItemsResolver = string[] | ItemsResolver | { [id: string]: string } | MapItemsResolver;

export class InputOptionsCommandParameter implements ICommandParameter {
    private value: string;
    private _items: string[] | { [id: string] : string };

    constructor(private readonly placeholder: string, private readonly items: ItemsOrItemsResolver, private readonly option?: string) {
    }
    
    public async setArguments(): Promise<boolean> {
        let items = await this.getItems();

        if (items.length <= 0) {
            return true;
        }

        if (items.length == 1) {
            this.value = this.getValue(items[0]);
            return true;
        } 

        items.sort((a, b) => {
            let x = a.toLowerCase();
            let y = b.toLowerCase();
            return x < y ? -1 : x > y ? 1 : 0;
        });

        let value = await vscode.window.showQuickPick(items, { placeHolder: this.placeholder });
        if (value !== null && value !== undefined) {
            this.value = this.getValue(value);
            return true;
        }
        
        return false;
    }

    public getArguments(): string[] {
        if (this.option)
            return [ this.option, this.value ];

        return [ this.value ];
    }

    private async getItems(): Promise<string[]> {
        if (typeof(this.items) == 'function') {
            this._items = await this.items();
            
        } else {
            this._items = this.items;
        }
       
        return this.parseItems(this._items);
    }

    private parseItems(items: string[] | { [id: string]: string }): string[] {
        if (Array.isArray(items)) return items;
        return Object.keys(items);
    }

    private getValue(value: string) {
        if (Array.isArray(this._items)) return value;
        return this._items[value];
    }
}