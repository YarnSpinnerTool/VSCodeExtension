import * as fs from 'fs';
import * as path from 'path';
import { getNodeInfo, parse, SerializedParseNode } from './parsing';
import each from 'jest-each';


export function loadParseTree(path) {
  const input = fs.readFileSync(path).toString();

  const json = JSON.parse(input);

  const parsedTree = new SerializedParseNode(json);
  return parsedTree;
}

var base = 'test/input';
const allYarnFiles = fs.readdirSync(base).filter(path => path.endsWith(".yarn"));

var testCases = []

allYarnFiles.forEach(sourcePath => {
  const dirName = path.dirname(sourcePath);
  const baseName = path.basename(sourcePath, ".yarn");
  const expectedParseTreePath = path.join(dirName, baseName + "-ParseTree.json");
  testCases.push([sourcePath, expectedParseTreePath])
})

testCases.forEach(testCase => {
  test('testing ' + testCase[0], () => {
    var source = fs.readFileSync(path.join(base, testCase[0])).toString();
    var { tree, errors } = parse(source);
    var expectedTree = loadParseTree(path.join(base, testCase[1]))

    expect(tree).toEqual(expectedTree);
  });
});


test('jumps are detected', () => {
  var source = `
title: One
---
<<jump Two>>
<<jump Three>>
===
title: Two
---
<<jump Three>>
===
title: Three
---
<<jump One>>
===
  `

  var result = parse(source);
  var nodes = getNodeInfo(result.parseContext);

  expect(nodes).toHaveLength(3);

  expect(nodes[0].title).toBe("One")
  expect(nodes[1].title).toBe("Two")
  expect(nodes[2].title).toBe("Three")

  expect(nodes[0].destinations).toHaveLength(2)
  expect(nodes[1].destinations).toHaveLength(1)
  expect(nodes[2].destinations).toHaveLength(1)

  expect(nodes[0].destinations[0].title).toBe("Two");
  expect(nodes[0].destinations[1].title).toBe("Three");
  expect(nodes[1].destinations[0].title).toBe("Three");
  expect(nodes[2].destinations[0].title).toBe("One");
});