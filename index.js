// const token = process.env.TOKEN;
const TelegramBot = require("node-telegram-bot-api");

require("dotenv").config();

// const papers = require("./papers");
const papers = {
  Biology: {
    Term_1: {
      2018: ["Grade-13"],
    },
    Term_2: {
      2020: ["Grade-13"],
      2021: ["Grade-13"],
    },
    Term_3: {
      2018: ["Grade-13"],
    },
  },

  Chemestry: {
    Term_1: {
      2016: ["Grade-13"],
      2018: ["Grade-13", "Grade-12"],
    },
    Term_2: {
      2020: ["Grade-13"],
      2021: ["Grade-13"],
    },
    Term_3: {
      2016: ["Grade-13"],
      2017: ["Grade-13"],
      2019: ["Grade-13"],
    },
  },
  Physics: {
    Term_1: {
      2018: ["Grade-13", "Grade-12"],
    },
    Term_2: {
      2018: ["Grade-13"],
      2020: ["Grade-13"],
      2021: ["Grade-13"],
    },
    Term_3: {
      2012: ["Grade-13"],
      2015: ["Grade-13"],
      2016: ["Grade-13"],
      2018: ["Grade-13"],
    },
  },
  Combined_Maths: {
    Term_1: {
      2012: ["Grade-12"],
      2014: ["Grade-12"],
    },
    Term_2: {
      2017: ["Grade-12"],
    },
    Term_3: {
      2020: ["Grade-13"],
      2018: ["Grade-13"],
    },
  },
};
const token = process.env.TOKEN;

const bot = new TelegramBot(token, { polling: true });

const welcomeMsg = `Hi! 👋
I'm the official telegram bot of Royal College Library Readers Association📚.

You can get last five years A/L past papers of Royal College here😃

❔ Wanna know about Commands ❔ 

Press /help to see all the commands!

Happy Learning! 🥳`;

const helpMsg = `Commands

/papers - To get past papers of Royal College

/about - To know about our Club`;

const aboutMsg = `Hey, We are Library Readers' Association of Royal College. Our association is the oldest student association at The Royal College, being established in 1846.`;

const subjects = ["Biology", "Chemestry", "Combined Maths", "Physics"];

const selectTermMSg =
  "Here are the past papers you want. Before that, select which term papers you want";


// sorry msg
const sorryMsg = `Sorry, we don't have that paper. Please try again!`;
const selectTermInline = {
  reply_markup: {
    inline_keyboard: [
      [
        {
          text: "✅ 1st Term",
          callback_data: "1st-Term",
        },
        {
          text: "✅ 2nd Term",
          callback_data: "2nd-Term",
        },
      ],
      [
        {
          text: "✅ 3rd Term",
          callback_data: "3rd-Term",
        },
      ],
      [
        {
          text: "🔙 Go Back",
          callback_data: "goBack",
        },
      ],
    ],
  },
};

bot.onText(/\/start/, (msg) => {
  console.log("Get msg",msg.chat.first_name);
  bot.sendMessage(msg.chat.id, welcomeMsg);
});

bot.onText(/\help/, (msg) => {
  bot.sendMessage(msg.chat.id, helpMsg);
});

bot.onText(/\papers/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "Hi 👋, I'm here to find past papers for you, so select the past papers of the subject you want👉.",
    {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Biology 🔬",
              callback_data: "Biology",
            },
            {
              text: "Chemestry 🧪",
              callback_data: "Chemestry",
            },
          ],
          [
            {
              text: "Combined Maths 📐",
              callback_data: "Combined_Maths",
            },
            {
              text: "Physics 📈",
              callback_data: "Physics",
            },
          ],
        ],
      },
    }
  );
});

let subject = "";
let term = "";
let term2 = ""
bot.on("callback_query", function (callbackQuery) {
  // 'callbackQuery' is of type CallbackQuery
  
  // if callback data is a subject sent select term msg
  if (
    subjects.includes(
      callbackQuery.data
      .split("-")
      .map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase())
      .join(" ")
      )
      ) {
    subject = callbackQuery.data;
    bot.sendMessage(callbackQuery.from.id, selectTermMSg, selectTermInline);
  }

  // else if callback data is a Term sent select year msg
  else if (callbackQuery.data == `${"1st" || "2nd" || "3rd"}-Term`) {
    // find which years in papers > subject > terms > years
    term = callbackQuery.data;
    term2 = "Term_"+callbackQuery.data.charAt(0);
    
    // console.log(subject, term2,"line_132");
    console.log(Object.keys(papers[subject][term2]));
    const years = Object.keys(papers[subject][term2]);
  
    const yearInlineData=[]
    for (let i = 0; i < years.length; i++) {
      const element = years[i];
      yearInlineData.push([{text:`📅${element}`,callback_data:`${element}`}])
    }
    const yearInline = {
      reply_markup: {
        inline_keyboard: yearInlineData,
      },
    };
    bot.sendMessage(callbackQuery.from.id, "Select the year", yearInline);
    
  }
  // else if callback data is a year sent grades in year as a msg
  else if(/(\d{4})/.test(callbackQuery.data)) {
    const grades = papers[subject][term2][callbackQuery.data];
    // genarate file names using grades

    const fileNames = [];
    for (let i = 0; i < grades.length; i++) {
      const element = grades[i];
      fileNames.push(`Royal-College-${subject}-${term}-Test-paper-${callbackQuery.data}-${element}.pdf`);
    }

    const gradesMsg = `Here are the ${subject} papers you want. Thank you for using our bot.🥳`;

    // send files
    for (let i = 0; i < fileNames.length; i++) {
      const element = fileNames[i];
      console.log(element)
      // add a try catch block to handle errors
      try {
        
          bot.sendDocument(callbackQuery.from.id, `https://github.com/LakiraMD/RCLR-bot-papers/raw/main/${element}`);
          
        
        
      }
      catch (error) {
        console.log("error")
        bot.sendMessage(callbackQuery.from.id,sorryMsg)
      }
      
    }
    bot.sendMessage(callbackQuery.from.id, gradesMsg);
  }
  console.log(callbackQuery);
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;
});
bot.on("polling_error", console.log);

