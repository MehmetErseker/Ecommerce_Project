using Core.Entities;

namespace Entities.Concrete
{
    public class UserAddressDto : IDto
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public List<AddressDto> Addresses { get; set; }
    }
}
