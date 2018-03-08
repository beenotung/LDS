import {tryRun} from "./utils";

export type MultiHash = string;
// export type Cert = string;
// export type HMac = string;

export interface Node<Content> {
    NodeID: MultiHash;
    ParentNodeID: MultiHash | null;
    Content: Content;
    NextNodeID: MultiHash | null;
    // Cert?: Cert;
    // SignOfNextNode?: HMac;
}

const nodes = new Map<MultiHash, Node<any>>();

export function getNode<A>(nodeID: MultiHash): Node<A> {
    return nodes.get(nodeID);
}

const hashs: string[] = [];

export function hash(content, parentNodeID?): string {
    const s = JSON.stringify({content, parentNodeID});
    const idx = hashs.indexOf(s);
    if (idx !== -1) {
        return "i-" + idx;
    }
    hashs.push(s);
    return "i-" + hashs.length;
}

export function boardcast(node: Node<any>) {
    console.log('create new node:', node);
    nodes.set(node.NodeID, node);
}

export function updateNextNodeId(nodeID: MultiHash, nextNodeID: MultiHash) {
    console.log('update nodeID', nodeID, 'of next node to', nextNodeID);
    let node = nodes.get(nodeID);
    if (!node || !node.NextNodeID) {
        return;
    }
    node.NextNodeID = nextNodeID;
}

export interface LinkedListItem<A> {
    data: A;
    nextNodeID?: MultiHash;
}

export class LinkedList<A> {
    root: Node<A>;
    headP: Promise<Node<A>>;

    constructor(root: Node<A>) {
        this.root = root;
        this.headP = tryRun(() => {
            let head = root;
            for (; head.NextNodeID; head = getNode(head.NextNodeID)) ;
            return head;
        });
    }

    static newEmptyList<A>() {
        const head = Symbol.for("head");
        const node: Node<A> = {
            NodeID: hash(head)
            , Content: head as any
            , NextNodeID: null
            , ParentNodeID: null
        };
        boardcast(node);
        return new LinkedList<A>(node);
    }

    async add(content: A) {
        const head = await this.headP;
        this.headP = tryRun(() => {
            const child: Node<A> = {
                NodeID: hash(content, head.NodeID)
                , ParentNodeID: head.NodeID
                , Content: content
                , NextNodeID: null
            };
            boardcast(child);
            updateNextNodeId(head.NodeID, child.NodeID);
            head.NextNodeID = child.NodeID;
            return child;
        });
    }

    toArray(): A[] {
        const root = this.root;
        if (!root.NextNodeID) {
            return []
        }
        const res: A[] = [];
        let acc = getNode<A>(root.NextNodeID);
        for (; ;) {
            res.push(acc.Content);
            if (acc.NextNodeID) {
                acc = getNode(acc.NextNodeID);
            } else {
                break;
            }
        }
        return res;
    }
}

export class TreeNode<A> {
    data: A;
    childrenIDs: MultiHash[];
}

export class Tree<A> {
    nodeP: Promise<Node<TreeNode<A>>>;

    constructor(node: Node<TreeNode<A>>) {
        this.nodeP = Promise.resolve(node);
    }

    static createNode<A>(data: A, childrenIDs: MultiHash[] = [], headNodeID?: MultiHash) {
        const content: TreeNode<A> = {data, childrenIDs: []};
        const node: Node<TreeNode<A>> = {
            NodeID: hash(content, headNodeID)
            , ParentNodeID: headNodeID
            , Content: {data, childrenIDs}
            , NextNodeID: null
        };
        return node;
    }

    async addChild(data: A) {
        const node = await this.nodeP;
        this.nodeP = tryRun(() => {
            const childNode = Tree.createNode(data, []);
            boardcast(childNode);
            const childrenIDs = node.Content.childrenIDs.map(x => x);
            childrenIDs.push(childNode.NodeID);
            const newNode = Tree.createNode(node.Content.data, childrenIDs, node.NodeID);
            boardcast(newNode);
            return newNode;
        });
    }
}