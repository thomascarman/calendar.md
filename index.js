const fs = require('fs');
const prompt = require('prompt');

const maxStr = (l,e) => e.length > l ? e.length : l;


//prompt.start();
//prompt.get(['year', 'month'], function (err, result) {
    //if(err) throw new Error(err);
    //const { year, month } = result;
    const year = 2022;
    const month = 6;

    if(!year) throw new Error('year required');
    if(!month) throw new Error('year required');

    const startMonStr = `${numAsString(year, 4)}-${numAsString(month, 2)}-${numAsString(1, 2)}T00:00:00`;
    const startMonDate = new Date(startMonStr);

    let cal = [];
    let week = [];
    for(let d = 1; d < 7 * 6 + 1; d++) {
        let offset = d-1-startMonDate.getDay();
        let curDate = new Date(startMonStr);
        curDate.setDate(curDate.getDate() + offset);

        //week.push(`[[${format(curDate)}|${curDate.getDate().toString()}]]`);
        week.push(`${format(curDate)}`);
    
        if(d % 7 === 0) {
            cal = [...cal, week];
            week = [];
        }
    }

    let fileText = [`## ${getMonthString(new Date(startMonStr).getMonth())} ${new Date(startMonStr).getFullYear()}`]
    fileText = [...fileText, '']

    let calText = getWeekHeaders()
    calText = [...calText, ...cal.reduce((s,c) => [...s, c], [])];

    let fTable = calText.join('').split('|').map(e => e.trim())

    let tableText = createTable(getWeekHeaders(), cal.reduce((s,c) => [...s, c], []), { align: ['center'] });

    fileText = [...fileText, ...tableText]

    fs.writeFile('calendar.md', fileText.join('\n'), function (err) {
        if (err) throw err;
        console.log('File is created successfully.');
        console.log(fileText.join('\n'));
    });
//});
//

function createTable(headers, data, options = null) {
    let len = 20 ?? options.len ?? [...data.reduce((l,e) => [...l, ...e], []), ...headers].reduce(maxStr, 0);
    let padding = 1;

    let table = [headers.map((c,i) => `${alignText(c, { len, align: options?.align?.[i] ?? options?.align, padding } )}`)];

    let line = new Array(len + padding * 2).fill('-')

    line = new Array(headers.length).fill(line.join(''));

    line = line.map((c,i) => {
        const align = options?.align?.[i] ?? options?.align;
        if(align === 'right' | align === 'center') c = c.replace(/.$/, ':');
        if(align === 'left' | align === 'center') c = c.replace(/^./, ':');
        return c
    });

    table = [...table, line];
    table = [...table, ...data.map(r => r.map((c,i) => `${alignText(c, { len, align: options?.align?.[i] ?? options?.align, padding } )}`))]

    return table.reduce((t,row) => [...t, '|' + row.reduce((r,c) => r + c + '|', '')], []);
}

function alignText(text, options) {
    let { len, padding, align } = options;
    len = len ?? 0;
    padding = padding ?? 0;
    align = align ?? 'left';

    // No need to align as text and padding options dont allow for it
    if(text.length >= len) return [...new Array(padding).fill(' '), ...text.split(''), ...new Array(padding).fill(' ')].join('');
        
    let template = [...new Array(padding).fill(' '), ...new Array(len).fill(' '), ...new Array(padding).fill(' ')];


    let offset = padding;

    if(align === 'right') offset = padding + (len - text.length);
    if(align === 'center') offset = padding + Math.ceil(len / 2) - (Math.ceil(text.length / 2) + (text.length % 2 === 0 ? 1 : 0));

    let fText = [...new Array(offset).fill(' '), ...text.split('')];

    return Object.values({...template, ...fText}).join('')
}

function format(date) {
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    return `${numAsString(y, 4)}-${numAsString(m, 2)}-${numAsString(d, 2)}`;
}

function numAsString(numb, d = 1) {
  let str = numb.toString();
  while (str.length < d) {
    str = '0' + str;
  }
  return str;
}

function getMonthString(m) {
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    return month[m];
}

function getWeekHeaders() {
    return ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
}
