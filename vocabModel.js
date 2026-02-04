export class VocabEntry {
  constructor(word, definition, partOfSpeech, example, count = 1) {
    this.word = word;
    this.definition = definition;
    this.partOfSpeech = partOfSpeech;
    this.example = example;
    this.count = count;
  }

  // You can add methods here
  incrementCount(increment = 1) {
    this.count += increment;
  }
}