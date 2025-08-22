using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Entities.DTOs
{
    public class OtpTicketDto
    {
        public string TicketId { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}
