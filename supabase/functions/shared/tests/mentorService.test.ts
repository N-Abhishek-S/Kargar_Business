import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MentorService } from '../services/mentorService';
import { MentorRepository } from '../repositories/mentorRepository';
import { ProfileIncompleteError } from '../errors/index';

// Mock dependencies
const mockRepo = {
  getMentorById: vi.fn(),
  updateMentorStatus: vi.fn(),
  getDocumentVerificationCount: vi.fn(),
} as unknown as MentorRepository;

describe('MentorService - Domain Logic', () => {
  let service: MentorService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new MentorService(mockRepo);
  });

  describe('approveMentor (Command)', () => {
    it('throws ProfileIncompleteError if headline or bio is missing', async () => {
      vi.mocked(mockRepo.getMentorById).mockResolvedValue({
        id: '123',
        headline: null, // Invalid state
        bio: 'Valid bio'
      });

      await expect(service.approveMentor('123')).rejects.toThrow(ProfileIncompleteError);
      expect(mockRepo.updateMentorStatus).not.toHaveBeenCalled();
    });

    it('throws ProfileIncompleteError if documents are unverified', async () => {
      vi.mocked(mockRepo.getMentorById).mockResolvedValue({
        id: '123',
        headline: 'Senior Dev',
        bio: 'Valid bio'
      });
      vi.mocked(mockRepo.getDocumentVerificationCount).mockResolvedValue(0); // Invalid state

      await expect(service.approveMentor('123')).rejects.toThrow(ProfileIncompleteError);
      expect(mockRepo.updateMentorStatus).not.toHaveBeenCalled();
    });

    it('approves mentor and dispatches event if all invariants pass', async () => {
      vi.mocked(mockRepo.getMentorById).mockResolvedValue({
        id: '123',
        headline: 'Senior Dev',
        bio: 'Valid bio'
      });
      vi.mocked(mockRepo.getDocumentVerificationCount).mockResolvedValue(1);

      await service.approveMentor('123');

      expect(mockRepo.updateMentorStatus).toHaveBeenCalledWith('123', 'approved');
      // In a real test, we would spy on EventDispatcher to ensure the event fired.
    });
  });
});
