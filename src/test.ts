import {LinkedList} from "./core";

async function main() {
    const list = LinkedList.newEmptyList();
    await list.add("apple");
    await list.add("orange");
    await list.add("banana");
    const xs = list.toArray();
    console.log({xs})
}

main();