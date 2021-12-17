#!/usr/bin/env node

const exprMeta = /^\d+\s\d+\s+\|/
const exprLeft = /^\d+\s+\|/
const exprRight = /^\s+\d+\s+\|/
const exprFile = /^Diff in (.*):$/

main()

async function main() {
  const lines = await readInput()

  let lastT;
  let group;
  let file

  lines
    .filter(line => line.match(exprFile) || line.match(exprLeft) || line.match(exprRight))
    .reduce((groups, line) => {
      const t = lineType(line);

      if (t === 'F') {
        file = line.replace(exprFile, '$1').replace(/^\.\//, '')

      } else {
        const lineNo = Number(line.replace(/^\s*(\d+)\s+.*$/, '$1'))
        if (t === 'L') {
          if (t !== lastT) {
            group = { file, line: lineNo, diff: [] }
            groups.push(group)
          }
          group.endLine = lineNo
        }

        // group.diff.push(line)
        group.diff.push(line.replace(/^.*\|/, ''))
      }

      lastT = t

      return groups
    }, [])
    .forEach(({ file, line, endLine, diff }) => {
      console.log(`::error file=${file},line=${line},endLine=${endLine},title=StyLua::${join(diff)}`)
    })
}

async function readInput() {
  const { stdin } = process

  stdin.resume()
  stdin.setEncoding('utf8')

  return new Promise((resolve) => {
    const result = [];

    let line = '';

    stdin.on('data', (chunk) => {
      const lines = `${line}${chunk}`.split('\n');
      line = lines.pop();
      result.push(...lines)
    });

    stdin.on('end', () => {
      result.push(line);
      resolve(result)
    });
  });
}

function lineType(line) {
  if (line.match(exprLeft)) {
    return 'L'
  } else if (line.match(exprRight)) {
    return 'R'
  } else if (line.match(exprFile)) {
    return 'F'
  }
}

function join(lines) {
  return lines.join('\n').replace(/%/g, '%25').replace(/\n/g, '%0A').replace(/\r/g, '%0D')
}
