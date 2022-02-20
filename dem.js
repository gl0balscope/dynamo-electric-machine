#!/usr/bin/env node

// boilerplate thing 1

/**
 * scaffold out dbad license - https://github.com/philsturgeon/dbad
 */

//
// experience:

/**
 * dem dbad --year=xxxx; --fullname="xxx xxxxx xxxxx"
 *
 * dbad is a "command" that is given to dem
 *
 * --year and --fullname are "customizations" that can made to the dbad "command"
 *
 * all dem "commands" should have the ability for default values
 *  maybe have configfile per "command?"
 */

//
// implementation plan:

/**
 * on execution of dbab command -- use node streams for all this (piping)?
 *  pull raw LICENSE.md file
 *      need to use github api
 *  then replace corresponding customizations in file -- they should have []'s around them in the raw file
 *      use regex search?
 *  then write whole file to system
 */

//
// implementation

import fetch from 'node-fetch'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'
import { pipeline } from 'node:stream/promises'
import { Transform } from 'node:stream'
import { createWriteStream } from 'node:fs'

const replaceYearAndName = (year, fullname) => {
  const replacementMap = {
    '[year]': year,
    '[fullname]': fullname
  }

  return new Transform({
    transform (chunk, encoding, callback) {
      callback(
        null,
        chunk.toString().replace(/\[year\]|\[fullname\]/gi, function yearAndNameReplacer (match) {
          return replacementMap[match]
        })
      )
    }
  })
}

async function parseDEM () {
  await yargs(hideBin(process.argv))
    .command(
      'dbad',
      'generate a DBAD license',
      function dbadBuilder (yargs) {
        return yargs
          .option('year', {
            type: 'number',
            description: 'The year the work was first published.'
          })
          .default('year', () => new Date().getFullYear(), 'the current year')
          .option('fullname', {
            type: 'string',
            description: 'The full name of the copyright owner.',
            demandOption: true
          })
      },
      async function dbadHandler (argv) {
        const { year, fullname } = argv

        const requestForDbadLicenseResponse = await fetch(
          'https://raw.githubusercontent.com/philsturgeon/dbad/master/LICENSE.md'
        )

        await pipeline(
          requestForDbadLicenseResponse.body,
          replaceYearAndName(year, fullname),
          createWriteStream('./LICENSE.md')
        )
      }
    )
    .help()
    .parse()
}

parseDEM()
