(async () => {
    var dom = document.getElementById("sum-of-words");

    const res = await fetch("/getCountOfAllWords");
    const data = await res.json();
    dom.textContent = "There are " + JSON.stringify(data.words_sum) + " words"; 
  })();

  (async () => {
    var dom = document.getElementById("chart-container");

    const res = await fetch("/getWordCountStats");
    const data = await res.json();

    const words = [];
    const counts = [];
    for (const d of data) {
      words.push(d.word);
      counts.push(d.counter);
    }

    var myChart = echarts.init(dom, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });
    var app = {};

    var option;

    option = {
      title: {
        text: "Frequency of Top 50 Words in Songs Lyrics",
        left: "center",
      },
      xAxis: {
        type: "category",
        name: "rows",
        data: words,
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
        
      },
      yAxis: {
        type: "value",
      },
      series: [
        {
          data: counts,
          type: "bar",
          itemStyle: {
            color: function (params) {
              var colorList = [
                "#5470C6",
                "#91CC75",
                "#EE6666",
                "#DDA0DD",
                "#FF9655",
                "#FFE180",
                "#6F6663",
              ];
              return colorList[params.dataIndex % 7];
            },
          },
          label: {
            show: true,
            position: "top",
          },
        },
      ],
    };

    if (option && typeof option === "object") {
      myChart.setOption(option);
    }

    window.addEventListener("resize", myChart.resize);
  })();

  (async () => {
    const res = await fetch("/getAllWordsAndGroups");
    const d = await res.json();

    const hashmap = {};
    for (const { group_name } of d) {
      if (hashmap[group_name]) {
        hashmap[group_name] = hashmap[group_name] + 1;
      } else {
        hashmap[group_name] = 1;
      }
    }

    const data = [];
    for (const [group, count] of Object.entries(hashmap)) {
      data.push({ value: count, name: group });
    }

    const dom = document.getElementById("chart-container2");
    const myChart = echarts.init(dom, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });
    const app = {};

    let option;

    option = {
      title: {
        text: "Distribution of User-Defined Word Groups",
        left: "center",
      },
      tooltip: {
        trigger: "item",
      },
      legend: {
        orient: "vertical",
        left: "left",
      },
      series: [
        {
          name: "Access From",
          type: "pie",
          radius: "50%",
          data,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    if (option && typeof option === "object") {
      myChart.setOption(option);
    }

    window.addEventListener("resize", myChart.resize);
  })();


  (async () => {
    var dom = document.getElementById("chart-container3");
  
    const res = await fetch("/getLinesInParagraphStats");
    const rawData = await res.json();
    if ( rawData.length == 0) return;
    // Count paragraphs by identifying gaps in row numbers
    let paragraphSize = 0;
    let paragraphSizeCount = {};
    let currentRow = rawData[0].row;
  
    rawData.forEach((item, index) => {
      if (item.row === currentRow) {
        paragraphSize++;
      } else {
        if (paragraphSize > 0) {
          // Count this paragraph size
          paragraphSizeCount[paragraphSize] = (paragraphSizeCount[paragraphSize] || 0) + 1;
        }
        // Reset for new paragraph
        paragraphSize = 1;
        currentRow = item.row;
      }
  
      // Increment row for expected next item in sequence
      currentRow++;
  
      // If last item, make sure to count the final paragraph
      if (index === rawData.length - 1) {
        paragraphSizeCount[paragraphSize] = (paragraphSizeCount[paragraphSize] || 0) + 1;
      }
    });
  
    const numOfRows = []; // Sizes of paragraphs
    const paragraphCounts = []; // Number of paragraphs for each size
    let totalParagraphs = 0;
  
    // Fill the arrays for the chart and calculate total paragraphs
    Object.keys(paragraphSizeCount).sort((a, b) => a - b).forEach(size => {
      totalParagraphs += paragraphSizeCount[size];
      numOfRows.push(size);
      paragraphCounts.push(paragraphSizeCount[size]);
    });
  
    const percentages = paragraphCounts.map(count => ((count / totalParagraphs) * 100).toFixed(2) + "%");
  
    var myChart = echarts.init(dom, null, {
      renderer: "canvas",
      useDirtyRect: false,
    });
    var app = {};
    var option;
  
    option = {
      title: {
        text: "Number of Paragraphs by Row Count",
        left: "center",
      },
      xAxis: {
        type: "category",
        data: numOfRows,
        axisLabel: {
          interval: 0,
          rotate: 45, // Rotate labels for better readability
        },
      },
      yAxis: {
        type: "value",
        name: "Number of Paragraphs"
      },
      series: [
        {
          data: paragraphCounts,
          type: "bar",
          itemStyle: {
            color: function (params) {
              var colorList = [
                "#5470C6",
                "#91CC75",
                "#EE6666",
                "#DDA0DD",
                "#FF9655",
                "#FFE180",
                "#6F6663",
              ];
              return colorList[params.dataIndex % 7];
            },
          },
          label: {
            show: true,
            position: "top",
            formatter: function(params) {
              return `${params.value} \n(${percentages[params.dataIndex]})`;
            },
          },
        },
      ],
    };
  
    if (option && typeof option === "object") {
      myChart.setOption(option);
    }
  
    window.addEventListener("resize", myChart.resize);
  })();
  



(async () => {
  var dom = document.getElementById("chart-container4");

  const res = await fetch("/getCountOfWordLengths");
  const data = await res.json();
  const wordLength = [];
  const counts = [];
  let totalCount = 0;

  for (const d of data) {
    wordLength.push(d.word_length);
    counts.push(d.total_count);
    totalCount += d.total_count;
  }

  const percentages = counts.map(count => ((count / totalCount) * 100).toFixed(2) + "%");

  var myChart = echarts.init(dom, null, {
    renderer: "canvas",
    useDirtyRect: false,
  });
  var app = {};
  var option;

  option = {
    title: {
      text: "Appearances of Words by Length",
      left: "center",
    },
    xAxis: {
      type: "category",
      data: wordLength,
      axisLabel: {
        interval: 0,
        rotate: 45,
      },
    },
    yAxis: {
      type: "value",
      name: "Count"
    },
    series: [
      {
        data: counts,
        type: "bar",
        itemStyle: {
          color: function (params) {
            var colorList = [
              "#5470C6",
              "#91CC75",
              "#EE6666",
              "#DDA0DD",
              "#FF9655",
              "#FFE180",
              "#6F6663",
            ];
            return colorList[params.dataIndex % 7];
          },
        },
        label: {
          show: true,
          position: "top",
          formatter: function(params) {
            return `${params.value} \n (${percentages[params.dataIndex]})`;
          },
        },
      },
    ],
  };

  if (option && typeof option === "object") {
    myChart.setOption(option);
  }

  window.addEventListener("resize", myChart.resize);
})();
