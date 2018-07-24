
module.exports = class TriviaQuestion {
    constructor(questionJson) {
        // response from trivia api
        this.data = questionJson.results[0];

        this.question = this.data.question;
        this.category = this.data.category;
        this.choices = this.data.incorrect_answers.concat(this.data.correct_answer);
        this.answerText = this.data.correct_answer;
        this.answer = null;
        this.difficulty = this.data.difficulty;
        this.sanitizeInputs();
    }

    isCorrect(possibleAnswer) {
        if (!possibleAnswer || possibleAnswer.length === 0) return false;
        return this.answer.toLowerCase() === possibleAnswer.toLowerCase();
    };

    sanitizeInputs() {
        this.question = decodeURIComponent(this.data.question);
        this.category = decodeURIComponent(this.data.category);
        this.answerText = decodeURIComponent(this.answerText);

        for (let i = 0; i < this.choices.length; i++) {
            this.choices[i] = decodeURIComponent(this.choices[i]);
        }
    }

    choicesString() {
        this.shuffle(this.choices);

        let choicesString = "";
        let choiceLetters = ['A', 'B', 'C', 'D'];
        
        for (let i = 0; i < this.choices.length; i++) { 
            let answerString = `${choiceLetters[i]}) ${this.choices[i]}`;
            let option = "";
            if (this.answerText.toLowerCase() === this.choices[i].toLowerCase()) {
                this.answer = choiceLetters[i];
            };

            if (i === this.choices.length - 1) {
                option = ", or " + answerString;
            } else {
                option = i === 0 ? answerString : ", " + answerString;
            }
            choicesString += option;
        }
        
        return choicesString;
    };

    shuffle(a) {
        var j, x, i;
        for (i = a.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = a[i - 1];
            a[i - 1] = a[j];
            a[j] = x;
        }
    };
}