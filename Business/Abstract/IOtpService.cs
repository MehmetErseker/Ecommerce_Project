using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IOtpService
    {
        OtpTicket CreateTicketFor(User user, TimeSpan ttl, int maxAttempts);
        bool Validate(string ticketId, string otp, out int userId);
    }
}
