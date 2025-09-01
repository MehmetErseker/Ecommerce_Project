using Core.Entities.Concrete;
using Core.Utilities.Results;
using Entities.Concrete;
using Entities.DTOs;

namespace Business.Abstract
{
    public interface IUserService
    {
        Task<IDataResult<List<User>>> GetAll();
        Task<IDataResult<List<User>>> GetAllUsers();
        Task<IDataResult<UserDto>> GetById(int userId);
        Task<IResult> Add(User user);
        Task<IResult> Update(User user);
        Task<IResult> Delete(int UserId); //soft delete
        Task<IResult> HardDelete(int UserId);
        Task<List<OperationClaim>> GetClaims(User user);
        Task<IDataResult<User>> GetByMail(string email);
    }
}
