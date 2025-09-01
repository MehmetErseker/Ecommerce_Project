using Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Entities.Concrete
{
    [Index(nameof(Email), IsUnique = true)]
    public class User:IEntity
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public byte[] PasswordSalt { get; set; }
        public byte[] PasswordHash { get; set; }
        public bool Status { get; set; }
        public string PhoneNumber { get; set; }
        public string Role { get; set; }
        public bool isDeleted { get; set; } //soft delete
    }
}
