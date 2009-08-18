package fi.hut.soberit.agilefant.model;

import java.util.ArrayList;
import java.util.Collection;

import javax.persistence.AttributeOverride;
import javax.persistence.AttributeOverrides;
import javax.persistence.Column;
import javax.persistence.Embedded;
import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinTable;
import javax.persistence.ManyToMany;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.persistence.OrderBy;
import javax.persistence.Table;

import org.hibernate.annotations.Type;
import org.hibernate.envers.Audited;
import org.hibernate.envers.NotAudited;

import flexjson.JSON;

/**
 * An entity bean representing a task.
 * 
 * @author rjokelai
 * 
 */

@Entity
@Table(name = "tasks")
@Audited
public class Task implements TimesheetLoggable, NamedObject {

    private int id;
    private String name;
    private String description;
    private Iteration iteration;
    private Story story;
    
    private TaskState state;
    private int rank = 0;
//    private Priority priority;
    
    private ExactEstimate effortLeft;
    private ExactEstimate originalEstimate;
    private Collection<User> responsibles = new ArrayList<User>();
    private Collection<TaskHourEntry> hourEntries = new ArrayList<TaskHourEntry>();

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    @Type(type = "escaped_truncated_varchar")
    @JSON
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @JSON
    @Type(type = "escaped_text")
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @ManyToOne
    @JSON(include = false)
    @NotAudited
    public Iteration getIteration() {
        return iteration;
    }

    public void setIteration(Iteration iteration) {
        this.iteration = iteration;
    }

    @ManyToOne
    @JSON(include = false)
    @NotAudited
    public Story getStory() {
        return story;
    }

    public void setStory(Story story) {
        this.story = story;
    }

    public void setEffortLeft(ExactEstimate estimate) {
        this.effortLeft = estimate;
    }

    @Embedded
    @AttributeOverrides(@AttributeOverride(name = "minorUnits", column = @Column(name = "effortleft")))
    public ExactEstimate getEffortLeft() {
        return effortLeft;
    }

    @Embedded
    @AttributeOverrides(@AttributeOverride(name = "minorUnits", column = @Column(name = "originalestimate")))
    public ExactEstimate getOriginalEstimate() {
        return originalEstimate;
    }

    public void setOriginalEstimate(ExactEstimate originalEstimate) {
        this.originalEstimate = originalEstimate;
    }

    @JSON
    @Enumerated(EnumType.ORDINAL)
    @Column(nullable = false)
    public TaskState getState() {
        return state;
    }

    public void setState(TaskState state) {
        this.state = state;
    }

    @ManyToMany(
            targetEntity = fi.hut.soberit.agilefant.model.User.class,
            fetch = FetchType.LAZY
    )
    @JoinTable(
            name = "task_user"
    )
    @OrderBy("initials asc")
    @JSON(include = false)
    public Collection<User> getResponsibles() {
        return responsibles;
    }
    
    public void setResponsibles(Collection<User> responsibles) {
        this.responsibles = responsibles;
    }

    @OneToMany(mappedBy="task")
    @OrderBy("date desc")
    @NotAudited
    public Collection<TaskHourEntry> getHourEntries() {
        return hourEntries;
    }
    
    public void setHourEntries(Collection<TaskHourEntry> hourEntries) {
        this.hourEntries = hourEntries;
    }

    
    @Column(nullable = false, columnDefinition = "int default 0")
    public int getRank() {
        return rank;
    }
    
    public void setRank(int rank) {
        this.rank = rank;
    }

}
