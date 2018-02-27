export type MultiHash = string;
export type Cert = string;
export type HMac = string;

export interface Node<Content> {
    NodeID: MultiHash;
    ParentNodeID: MultiHash | null;
    Content: Content;
    NextNodeID: MultiHash | null;
    Cert?: Cert;
    SignOfNextNode?: HMac;
}

export function getNode(nodeID: MultiHash): Node {
    return {} as any;
}

export function hash(content, parentNodeID?): string {
    return JSON.stringify({content, parentNodeID});
}

export function boardcast(node: Node) {
    console.log('create new node:', node);
}

export function updateNextNodeId(nodeID: MultiHash, nextNodeID: MultiHash) {
    console.log('update nodeID', nodeID, 'of next node to', nextNodeID);
}

export class LinkedList {
    root: Node;
    head: Node;

    constructor(root: Node) {
        this.root = root;
        for (this.head = root; this.head.NextNodeID; this.head = getNode(this.head.NextNodeID)) ;
    }

    add(content) {
        const child: Node = {
            NodeID: hash(content, this.head.NodeID)
            , ParentNodeID: this.head.NodeID
            , Content: content
            , NextNodeID: null
        };
        boardcast(child);
        updateNextNodeId(this.head.NodeID, child.NodeID);
        this.head.NextNodeID = child.NodeID;
        this.head = child;
    }
}

export class LeafList extends Node<string[]> {
}

export class Tree {
    root: Node;
    children: LeafList;

    constructor(root: Node, children: LeafList) {
        this.root = root;
        this.children = children;
    }

    addChild(content) {
        /**
         * 1. add new node of the content
         * 2. add new node id into children list (new version)
         * 3. update self
         * */
        const newNode = {} as Node;
        const child: Node = {
            NodeID: hash(content, this.head.NodeID)
            , ParentNodeID: this.head.NodeID
            , Content: [].concat(this.children.Content, [newNode.NodeID])
            , NextNodeID: null
        };
        boardcast(child);
    }
}