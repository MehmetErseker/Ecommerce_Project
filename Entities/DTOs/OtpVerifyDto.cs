using Core.Entities;

namespace Entities.DTOs
{
    public class OtpVerifyDto : IDto
    {
        public string TicketId { get; set; }
        public string Otp { get; set; }
    }
}
