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
    var {tree, errors} = parse(source);
    var expectedTree = loadParseTree(path.join(base, testCase[1]))
    
    expect(tree).toEqual(expectedTree);
  });
});

