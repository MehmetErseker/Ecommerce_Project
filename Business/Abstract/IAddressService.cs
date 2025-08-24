using Core.Utilities.Results;
using Entities.Concrete;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Business.Abstract
{
    public interface IAddressService
    {
        Task<IDataResult<List<AddressDto>>> GetAll();
        Task<IResult> Add(AddressDto addressDto);
        Task<IResult> Delete(int addressId);
        Task<IResult> Update(Address address);
        Task<IDataResult<Address>> GetById(int addressId);
    }
}
