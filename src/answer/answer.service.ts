import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { QuestionService } from '@/question/question.service';

import { Answer } from './answer.entity';

@Injectable()
export class AnswerService {
  constructor(
    @InjectRepository(Answer) private readonly answerRepository: Repository<Answer>,
    private readonly questionService: QuestionService,
  ) {}

  async createAnswer(body: any) {
    const { questionId, ...content } = body;

    if (!questionId) {
      return null;
    }

    const question = await this.questionService.findOne(+questionId);
    if (!question) {
      return null;
    }

    const answer = new Answer();
    answer.question = question;
    answer.answerContent = JSON.stringify(content);

    return this.answerRepository.save(answer);
  }
}
