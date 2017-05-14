'use strict';

const watch = require('node-watch');
const spawn = require('child_process').spawn;
const baseDir = 'diagrams';
const texDir = 'tex';
const pdfDir = 'pdf';
const svgDir = 'svg';


console.log(`Watching ${baseDir}/${texDir} folder...`);

watch(`${baseDir}/${texDir}`, { recursive: true }, function(evt, name) {
  console.log('%s changed. Will try to compile to PDF', name);
  const pdflatex = spawn(
    'pdflatex',
    ['-halt-on-error', '-output-directory', `${baseDir}/${pdfDir}`,
    name]
  );

  pdflatex.stdout.on( 'data', data => {
      console.log(`stdout: ${data}`);
  });

  pdflatex.stderr.on( 'data', data => {
      console.log(`stderr: ${data}`);
  });

  pdflatex.on('close', code => {
      console.log( `child process exited with code ${code}` );
      const pdfName = [...name.split('/')].pop().split('.')[0] + '.pdf'
      const svgName = [...name.split('/')].pop().split('.')[0] + '.svg'
      console.log('%s changed. Will try to compile to SVG', name);
      const pdf2svg = spawn('pdf2svg', [`${baseDir}/${pdfDir}/${pdfName}`, `${baseDir}/${svgDir}/${svgName}`]);

      pdf2svg.stdout.on('data', data => {
        console.log(`stdout: ${data}`);
      });

      pdf2svg.stderr.on('data', data => {
        console.log(`stderr: ${data}`);
      });

      pdf2svg.on('close', code => {
        console.log(`child process exited with code ${code}`);
        if (code === 0) {
          console.log('Conversion suffessful!');
        }
      });
    });
});
