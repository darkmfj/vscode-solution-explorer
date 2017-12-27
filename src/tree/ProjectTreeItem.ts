import { TreeItem, TreeItemCollapsibleState } from "./TreeItem";
import { ContextValues } from "./ContextValues";
import { ProjectInSolution } from "../model/Solutions";
import { Project } from "../model/Projects";
import { ProjectReferencesTreeItem } from "./ProjectReferencesTreeItem";
import * as TreeItemFactory from "./TreeItemFactory";

export class ProjectTreeItem extends TreeItem {
    private children: TreeItem[] = null;

    constructor(private readonly project: Project, private readonly projectInSolution: ProjectInSolution, parent: TreeItem) {
        super(projectInSolution.ProjectName, TreeItemCollapsibleState.Collapsed, ContextValues.Project, parent, projectInSolution.FullPath);
    }

    public getChildren(): Thenable<TreeItem[]> {
        if (this.children) {
            return Promise.resolve(this.children);
        }

        this.children = [];
        this.children.push(new ProjectReferencesTreeItem(this.project, this));

        TreeItemFactory.CreateItemsFromProject(this, this.project).forEach(item => this.children.push(item));

        return Promise.resolve(this.children);
    }

    public refresh(): void {
        this.children = null;
    }
    
    public createFile(name: string): string {
        return this.project.createFile('', name);
    }

    public createFolder(name: string): void {
        this.project.createFolder(name);
    }
}