using Abp.Domain.Entities;
using HelpDesk.Authorization.Users;
using System.ComponentModel.DataAnnotations.Schema;

namespace HelpDesk.Issues
{
    public class IssuesAssignees : Entity<long>
    {
        public long IssueId { get; set; }
        public long UserId { get; set; }

        [ForeignKey(nameof(IssueId))]
        public virtual Issues Issues { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }
}